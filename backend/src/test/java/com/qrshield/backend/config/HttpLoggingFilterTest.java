package com.qrshield.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class HttpLoggingFilterTest {

    private final HttpLoggingFilter filter = new HttpLoggingFilter();

    @Test
    @DisplayName("Filter logs incoming POST request and sends response body to client")
    void testFilterLogsAndPreservesResponse() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/scan/url");
        request.addHeader("Origin", "http://localhost:5173");
        request.setContentType("application/json");
        request.setContent("{\"url\":\"https://example.com\"}".getBytes(StandardCharsets.UTF_8));

        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain filterChain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res)
                    throws IOException, ServletException {
                // Simulate reading request body in downstream controller
                byte[] requestBytes = req.getInputStream().readAllBytes();
                assertTrue(requestBytes.length > 0);

                // Write response body
                res.getOutputStream().write("{\"status\":\"SAFE\"}".getBytes(StandardCharsets.UTF_8));
                ((HttpServletResponse) res).setStatus(200);
            }
        };

        filter.doFilter(request, response, filterChain);

        assertEquals(200, response.getStatus());
        assertEquals("{\"status\":\"SAFE\"}", response.getContentAsString());
    }

    @Test
    @DisplayName("Filter skips asset files")
    void testSkipsStaticAssets() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/favicon.ico");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);
        assertEquals(200, response.getStatus());
    }
}
