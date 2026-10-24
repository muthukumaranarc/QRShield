package com.qrshield.backend.reporting;

import jakarta.validation.constraints.NotBlank;

public class ThreatReportRequest {

    private String scanId;

    @NotBlank(message = "targetUrl cannot be blank")
    private String targetUrl;

    @NotBlank(message = "reportType cannot be blank")
    private String reportType;

    private String comments;

    public ThreatReportRequest() {}

    public ThreatReportRequest(String scanId, String targetUrl, String reportType, String comments) {
        this.scanId = scanId;
        this.targetUrl = targetUrl;
        this.reportType = reportType;
        this.comments = comments;
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

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
