package com.qrshield.backend.sandbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qrshield.backend.dto.sandbox.WorkerScanRequest;
import com.qrshield.backend.dto.sandbox.WorkerScanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Secure HTTP client that communicates with the Guest Worker running inside the disposable VM
 * across the isolated host-only network.
 */
@Component
public class GuestWorkerClient {

    private static final Logger log = LoggerFactory.getLogger(GuestWorkerClient.class);
    private static final String AUTH_HEADER = "X-Worker-Auth-Token";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GuestWorkerClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    /**
     * Checks if the guest worker is healthy and ready to accept inspection jobs.
     */
    public boolean checkHealth(String host, int port, String authToken) {
        String url = String.format("http://%s:%d/health", host, port);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header(AUTH_HEADER, authToken)
                    .timeout(Duration.ofSeconds(2))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            log.trace("Health probe failed for {}: {}", url, e.getMessage());
            return false;
        }
    }

    /**
     * Submits a validated target URL to the guest worker for Playwright browser inspection.
     */
    public WorkerScanResponse submitScan(String host, int port, String authToken, WorkerScanRequest scanRequest) {
        String url = String.format("http://%s:%d/api/worker/scan", host, port);
        try {
            String jsonPayload = objectMapper.writeValueAsString(scanRequest);

            int requestTimeout = Math.max(10, scanRequest.getTimeoutSeconds() + 10);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header(AUTH_HEADER, authToken)
                    .timeout(Duration.ofSeconds(requestTimeout))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            log.info("Submitting scan request {} to guest worker at {}", scanRequest.getScanId(), url);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), WorkerScanResponse.class);
            } else {
                WorkerScanResponse err = new WorkerScanResponse();
                err.setScanId(scanRequest.getScanId());
                err.setStatus("FAILED");
                err.setErrorMessage("Worker returned HTTP status " + response.statusCode() + ": " + response.body());
                return err;
            }

        } catch (Exception e) {
            log.error("Failed communicating with guest worker for scan {}: {}", scanRequest.getScanId(), e.getMessage());
            WorkerScanResponse err = new WorkerScanResponse();
            err.setScanId(scanRequest.getScanId());
            err.setStatus("FAILED");
            err.setErrorMessage("Guest worker communication error: " + e.getMessage());
            return err;
        }
    }
}
