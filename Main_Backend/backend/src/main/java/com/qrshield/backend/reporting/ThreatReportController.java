package com.qrshield.backend.reporting;

import com.qrshield.backend.auth.JwtTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "*")
public class ThreatReportController {

    private final ThreatReportService threatReportService;
    private final JwtTokenService jwtTokenService;

    public ThreatReportController(ThreatReportService threatReportService, JwtTokenService jwtTokenService) {
        this.threatReportService = threatReportService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/report")
    public ResponseEntity<ThreatReportResponse> submitReport(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ThreatReportRequest request) {

        String userId = null;
        if (authHeader != null && !authHeader.isBlank()) {
            Optional<String> userIdOpt = jwtTokenService.validateTokenAndGetUserId(authHeader);
            if (userIdOpt.isPresent()) {
                userId = userIdOpt.get();
            }
        }

        ThreatReportResponse response = threatReportService.submitReport(userId, request);
        return ResponseEntity.ok(response);
    }
}
