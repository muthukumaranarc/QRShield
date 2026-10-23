package com.qrshield.worker.controller;

import com.qrshield.worker.dto.WorkerScanRequest;
import com.qrshield.worker.dto.WorkerScanResponse;
import com.qrshield.worker.service.BrowserSandboxService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class WorkerController {

    private static final Logger log = LoggerFactory.getLogger(WorkerController.class);

    @Value("${worker.auth.token:qrshield-sandbox-secure-token-2026}")
    private String expectedAuthToken;

    private final BrowserSandboxService sandboxService;

    public WorkerController(BrowserSandboxService sandboxService) {
        this.sandboxService = sandboxService;
    }

    /**
     * Unauthenticated or token-authenticated liveness and health probe.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck(
            @RequestHeader(value = "X-Worker-Auth-Token", required = false) String token) {

        if (token != null && !token.equals(expectedAuthToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("status", "UNAUTHORIZED"));
        }

        return ResponseEntity.ok(Map.of(
                "status", "HEALTHY",
                "service", "QRShield-Guest-Worker",
                "timestamp", LocalDateTime.now().toString(),
                "sandboxMode", "Chromium-Headless-NonRoot"
        ));
    }

    /**
     * Authenticated scan analysis endpoint.
     */
    @PostMapping("/api/worker/scan")
    public ResponseEntity<?> analyzeUrl(
            @RequestHeader(value = "X-Worker-Auth-Token", required = false) String token,
            @RequestBody WorkerScanRequest request) {

        if (token == null || !token.equals(expectedAuthToken)) {
            log.warn("Unauthorized scan attempt received from management interface.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized: Invalid or missing X-Worker-Auth-Token header"));
        }

        if (request.getTargetUrl() == null || request.getTargetUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing targetUrl"));
        }

        log.info("Received authenticated scan request for: {}", request.getTargetUrl());
        WorkerScanResponse response = sandboxService.inspectUrl(request);
        return ResponseEntity.ok(response);
    }
}
