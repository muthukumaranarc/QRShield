package com.qrshield.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Global HTTP Request/Response Terminal Logger.
 * Automatically intercepts incoming HTTP traffic from frontend clients and prints
 * high-visibility diagnostics to the terminal console (Method, URI, Origin, Payload, Status, Latency).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class HttpLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(HttpLoggingFilter.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final int MAX_PAYLOAD_LENGTH = 1000;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip logging for internal favicon or asset noise if any
        if (path.endsWith(".ico") || path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".png")) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request, 1024 * 1024);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        String timestamp = LocalDateTime.now().format(TIME_FORMATTER);

        String method = request.getMethod();
        String queryString = request.getQueryString() != null ? "?" + request.getQueryString() : "";
        String fullPath = path + queryString;
        String origin = request.getHeader("Origin");
        if (origin == null || origin.isBlank()) {
            origin = request.getHeader("Referer");
        }
        if (origin == null || origin.isBlank()) {
            origin = "Direct / Non-Browser";
        }
        String clientIp = getClientIp(request);

        // Print incoming request notification to terminal
        System.out.println("\n================================================================================");
        System.out.printf(">>> [FRONTEND REQUEST] %s %s%n", method, fullPath);
        System.out.printf("    Time: %s | Origin: %s | Client IP: %s%n", timestamp, origin, clientIp);

        String contentType = request.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            System.out.printf("    Content-Type: %s%n", contentType);
        }

        try {
            // Execute the request pipeline
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = responseWrapper.getStatus();

            // Print request payload if available (e.g. JSON from frontend)
            String requestPayload = extractPayload(requestWrapper);
            if (!requestPayload.isBlank()) {
                System.out.println("    Request Payload:");
                System.out.println("    " + requestPayload);
            }

            // Print response status and execution time
            String statusIndicator = status < 400 ? "SUCCESS" : "ERROR/WARN";
            System.out.printf("<<< [FRONTEND RESPONSE] %s %s -> HTTP %d (%s) [%d ms]%n",
                    method, fullPath, status, statusIndicator, duration);
            System.out.println("================================================================================");

            // Log SLF4J structured event
            log.info("[HTTP] {} {} from {} -> Status: {} ({}ms)", method, fullPath, origin, status, duration);

            // CRITICAL: copy body back to real response so the client receives the data!
            responseWrapper.copyBodyToResponse();
        }
    }

    private String extractPayload(ContentCachingRequestWrapper request) {
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase().contains("multipart/form-data")) {
            return "[Multipart Binary Data - File Upload]";
        }

        byte[] buf = request.getContentAsByteArray();
        if (buf.length > 0) {
            int length = Math.min(buf.length, MAX_PAYLOAD_LENGTH);
            String payload = new String(buf, 0, length, StandardCharsets.UTF_8).trim();
            if (buf.length > MAX_PAYLOAD_LENGTH) {
                payload += "... [truncated " + (buf.length - MAX_PAYLOAD_LENGTH) + " bytes]";
            }
            return payload;
        }
        return "";
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }
}
