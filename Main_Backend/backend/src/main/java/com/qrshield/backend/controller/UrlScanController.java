package com.qrshield.backend.controller;

import com.qrshield.backend.dto.DashboardStatsResponse;
import com.qrshield.backend.dto.ScanRequest;
import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanSource;
import com.qrshield.backend.service.QrCodeDecodeService;
import com.qrshield.backend.service.ScanHistoryService;
import com.qrshield.backend.service.UrlAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UrlScanController {

    private final UrlAnalysisService analysisService;
    private final ScanHistoryService historyService;
    private final QrCodeDecodeService qrCodeDecodeService;

    public UrlScanController(UrlAnalysisService analysisService,
                             ScanHistoryService historyService,
                             QrCodeDecodeService qrCodeDecodeService) {
        this.analysisService = analysisService;
        this.historyService = historyService;
        this.qrCodeDecodeService = qrCodeDecodeService;
    }

    /**
     * Primary endpoint: Analyze a URL (sent by QR decoder or entered manually)
     * Provides provider name, cybersecurity risk assessment, warnings, and recommendations.
     */
    @PostMapping("/analyze")
    public ResponseEntity<ScanResponse> analyzeUrl(@Valid @RequestBody ScanRequest request) {
        ScanResponse response = analysisService.analyze(request);
        ScanResponse savedResponse = historyService.saveScan(response);
        return ResponseEntity.ok(savedResponse);
    }

    /**
     * Optional endpoint: Upload a QR code image directly to decode & analyze
     */
    @PostMapping(value = "/qr-image", consumes = "multipart/form-data")
    public ResponseEntity<ScanResponse> analyzeQrImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "notes", required = false) String notes) throws Exception {

        String decodedUrl = qrCodeDecodeService.decodeQrCodeImage(file);

        ScanRequest request = new ScanRequest(decodedUrl, ScanSource.GALLERY_IMAGE);
        request.setNotes(notes != null ? notes : "Scanned from uploaded QR image (" + file.getOriginalFilename() + ")");

        ScanResponse response = analysisService.analyze(request);
        ScanResponse savedResponse = historyService.saveScan(response);
        return ResponseEntity.ok(savedResponse);
    }

    /**
     * Retrieve scan history with optional category filtering and search query
     */
    @GetMapping("/history")
    public ResponseEntity<List<ScanResponse>> getHistory(
            @RequestParam(value = "category", required = false) RiskCategory category,
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(historyService.getHistory(category, search));
    }

    /**
     * Get details of a single scan by ID
     */
    @GetMapping("/history/{id}")
    public ResponseEntity<ScanResponse> getScanById(@PathVariable String id) {
        return historyService.getScanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete an individual scan record
     */
    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, Object>> deleteScan(@PathVariable String id) {
        boolean deleted = historyService.deleteScan(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Scan record removed successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Scan record not found"));
        }
    }

    /**
     * Clear all scan records from history
     */
    @DeleteMapping("/history")
    public ResponseEntity<Map<String, Object>> clearHistory() {
        historyService.clearAllHistory();
        return ResponseEntity.ok(Map.of("success", true, "message", "All scan history cleared"));
    }

    /**
     * Dashboard statistics: Total scans, risk distributions, recent scans
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(historyService.getDashboardStats());
    }
}
