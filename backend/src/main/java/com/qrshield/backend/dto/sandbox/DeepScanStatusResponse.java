package com.qrshield.backend.dto.sandbox;

import com.qrshield.backend.entity.ScanLifecycleStatus;
import com.qrshield.backend.entity.VmLifecycleStatus;

import java.time.LocalDateTime;

public class DeepScanStatusResponse {

    private String scanId;
    private ScanLifecycleStatus lifecycleStatus;
    private VmLifecycleStatus vmLifecycleStatus;
    private int progressPercentage;
    private String statusMessage;
    private LocalDateTime scannedAt;
    private Long executionDurationMs;

    public DeepScanStatusResponse() {}

    public DeepScanStatusResponse(String scanId, ScanLifecycleStatus lifecycleStatus, VmLifecycleStatus vmLifecycleStatus, int progressPercentage, String statusMessage) {
        this.scanId = scanId;
        this.lifecycleStatus = lifecycleStatus;
        this.vmLifecycleStatus = vmLifecycleStatus;
        this.progressPercentage = progressPercentage;
        this.statusMessage = statusMessage;
        this.scannedAt = LocalDateTime.now();
    }

    public String getScanId() {
        return scanId;
    }

    public void setScanId(String scanId) {
        this.scanId = scanId;
    }

    public ScanLifecycleStatus getLifecycleStatus() {
        return lifecycleStatus;
    }

    public void setLifecycleStatus(ScanLifecycleStatus lifecycleStatus) {
        this.lifecycleStatus = lifecycleStatus;
    }

    public VmLifecycleStatus getVmLifecycleStatus() {
        return vmLifecycleStatus;
    }

    public void setVmLifecycleStatus(VmLifecycleStatus vmLifecycleStatus) {
        this.vmLifecycleStatus = vmLifecycleStatus;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }

    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }
}
