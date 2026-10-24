package com.qrshield.worker.dto;

public class WorkerScanRequest {
    private String scanId;
    private String targetUrl;
    private int timeoutSeconds;

    public WorkerScanRequest() {}

    public WorkerScanRequest(String scanId, String targetUrl, int timeoutSeconds) {
        this.scanId = scanId;
        this.targetUrl = targetUrl;
        this.timeoutSeconds = timeoutSeconds;
    }

    public String getScanId() {
        return scanId;
    }

    public void setScanId(String scanId) {
        this.scanId = scanId;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }
}
