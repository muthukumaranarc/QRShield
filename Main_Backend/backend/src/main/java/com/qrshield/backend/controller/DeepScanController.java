package com.qrshield.backend.controller;

import com.qrshield.backend.dto.sandbox.DeepScanRequest;
import com.qrshield.backend.dto.sandbox.DeepScanResponse;
import com.qrshield.backend.dto.sandbox.DeepScanStatusResponse;
import com.qrshield.backend.entity.ScanRecord;
import com.qrshield.backend.entity.ScanSource;
import com.qrshield.backend.sandbox.DeepScanJobManager;
import com.qrshield.backend.service.QrCodeDecodeService;
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
public class DeepScanController {

    private final DeepScanJobManager jobManager;
    private final QrCodeDecodeService qrCodeDecodeService;

    public DeepScanController(DeepScanJobManager jobManager, QrCodeDecodeService qrCodeDecodeService) {
        this.jobManager = jobManager;
        this.qrCodeDecodeService = qrCodeDecodeService;
    }

    /**
     * Initiates asynchronous deep sandbox analysis for a submitted URL.
     * Returns the scanId immediately in QUEUED state.
     */
    @PostMapping("/deep-analysis")
    public ResponseEntity<Map<String, Object>> submitDeepAnalysis(@Valid @RequestBody DeepScanRequest request) {
        ScanRecord record = jobManager.submitJob(
                request.getUrl(),
                request.getUrl(),
                request.getSource() != null ? request.getSource() : ScanSource.MANUAL_URL,
                request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "scanId", record.getId(),
                "status", record.getLifecycleStatus(),
                "message", "Deep sandbox analysis enqueued. Check status at /api/scan/" + record.getId() + "/status"
        ));
    }

    /**
     * Decodes an uploaded QR image and enqueues it for deep sandbox analysis.
     */
    @PostMapping(value = "/deep-analysis/qr-image", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> submitDeepAnalysisQrImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "notes", required = false) String notes) throws Exception {

        String decodedContent = qrCodeDecodeService.decodeQrCodeImage(file);
        ScanRecord record = jobManager.submitJob(
                decodedContent,
                decodedContent,
                ScanSource.GALLERY_IMAGE,
                notes != null ? notes : "Decoded from QR image (" + file.getOriginalFilename() + ")"
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "scanId", record.getId(),
                "decodedContent", decodedContent,
                "status", record.getLifecycleStatus(),
                "message", "QR decoded. Deep sandbox analysis enqueued."
        ));
    }

    /**
     * Polls the current lifecycle progress of a scan job.
     */
    @GetMapping("/{scanId}/status")
    public ResponseEntity<DeepScanStatusResponse> getScanStatus(@PathVariable String scanId) {
        return jobManager.getScanStatus(scanId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves the complete structured results of a scan.
     */
    @GetMapping("/{scanId}")
    public ResponseEntity<DeepScanResponse> getScanResult(@PathVariable String scanId) {
        return jobManager.getScanResult(scanId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Administrative endpoint to review all historical scans.
     */
    @GetMapping("/admin/scans")
    public ResponseEntity<List<DeepScanResponse>> getAllAdminScans() {
        return ResponseEntity.ok(jobManager.getAllScans());
    }
}
