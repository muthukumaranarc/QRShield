package com.qrshield.backend.reporting;

public class ThreatReportResponse {

    private String reportId;
    private String status;
    private String message;

    public ThreatReportResponse() {}

    public ThreatReportResponse(String reportId, String status, String message) {
        this.reportId = reportId;
        this.status = status;
        this.message = message;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
