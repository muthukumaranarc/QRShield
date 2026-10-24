package com.qrshield.backend.reporting;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "threat_reports", indexes = {
        @Index(name = "idx_report_target_url", columnList = "target_url"),
        @Index(name = "idx_report_type", columnList = "report_type"),
        @Index(name = "idx_report_status", columnList = "status")
})
public class ThreatReport {

    @Id
    @Column(name = "id", length = 32, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "scan_id", length = 64)
    private String scanId;

    @Column(name = "target_url", length = 2048, nullable = false)
    private String targetUrl;

    @Column(name = "report_type", length = 64, nullable = false)
    private String reportType;

    @Column(name = "comments", length = 2048)
    private String comments;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;

    public ThreatReport() {
        this.id = generateId();
        this.status = "RECEIVED";
        this.reportedAt = LocalDateTime.now();
    }

    public ThreatReport(String userId, String scanId, String targetUrl, String reportType, String comments) {
        this.id = generateId();
        this.userId = userId;
        this.scanId = scanId;
        this.targetUrl = targetUrl;
        this.reportType = reportType != null ? reportType.toUpperCase() : "PHISHING";
        this.comments = comments;
        this.status = "RECEIVED";
        this.reportedAt = LocalDateTime.now();
    }

    private static String generateId() {
        return "rep_" + UUID.randomUUID().toString().replace("-", "").substring(0, 7);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(LocalDateTime reportedAt) {
        this.reportedAt = reportedAt;
    }
}
