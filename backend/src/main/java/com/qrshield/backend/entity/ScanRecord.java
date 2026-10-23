package com.qrshield.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "scan_records", indexes = {
        @Index(name = "idx_scan_domain", columnList = "domain"),
        @Index(name = "idx_scan_risk_category", columnList = "riskCategory"),
        @Index(name = "idx_scan_scanned_at", columnList = "scannedAt"),
        @Index(name = "idx_scan_lifecycle_status", columnList = "lifecycleStatus")
})
@org.springframework.data.mongodb.core.mapping.Document(collection = "scan_records")
public class ScanRecord {

    @Id
    @org.springframework.data.annotation.Id
    @Column(name = "id", length = 64, nullable = false, updatable = false)
    private String id;

    @Column(name = "original_url", length = 2048)
    private String originalUrl;

    @Column(name = "final_destination_url", length = 2048)
    private String finalDestinationUrl;

    @Column(name = "original_decoded_content", length = 4096)
    private String originalDecodedContent;

    @Column(name = "domain", length = 255)
    private String domain;

    @Column(name = "provider_name", length = 255)
    private String providerName;

    @Column(name = "ip_address", length = 128)
    private String ipAddress;

    @Column(name = "protocol", length = 32)
    private String protocol;

    @Column(name = "is_https")
    private boolean isHttps;

    @Column(name = "has_redirects")
    private boolean hasRedirects;

    @Column(name = "redirect_count")
    private int redirectCount;

    @Column(name = "risk_score")
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_category", length = 32)
    private RiskCategory riskCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32)
    private ScanStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_status", length = 32)
    private ScanLifecycleStatus lifecycleStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "vm_lifecycle_status", length = 32)
    private VmLifecycleStatus vmLifecycleStatus;

    @Column(name = "vm_name", length = 128)
    private String vmName;

    @Column(name = "execution_duration_ms")
    private Long executionDurationMs;

    @Column(name = "cleanup_status", length = 64)
    private String cleanupStatus;

    @Column(name = "page_title", length = 512)
    private String pageTitle;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Lob
    @Column(name = "warning_signs", columnDefinition = "TEXT")
    private String warningSigns;

    @Lob
    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Lob
    @Column(name = "security_findings_json", columnDefinition = "TEXT")
    private String securityFindingsJson;

    @Lob
    @Column(name = "redirect_summary_json", columnDefinition = "TEXT")
    private String redirectSummaryJson;

    @Lob
    @Column(name = "analysis_details_json", columnDefinition = "TEXT")
    private String analysisDetailsJson;

    @Column(name = "download_detected")
    private boolean downloadDetected;

    @Lob
    @Column(name = "download_artifacts_json", columnDefinition = "TEXT")
    private String downloadArtifactsJson;

    @Lob
    @Column(name = "limitations_json", columnDefinition = "TEXT")
    private String limitationsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "scan_source", length = 32)
    private ScanSource scanSource;

    @Column(name = "notes", length = 1024)
    private String notes;

    @Column(name = "error_message", length = 2048)
    private String errorMessage;

    @Column(name = "scanned_at", nullable = false)
    private LocalDateTime scannedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public ScanRecord() {
        this.id = UUID.randomUUID().toString();
        this.scannedAt = LocalDateTime.now();
        this.lifecycleStatus = ScanLifecycleStatus.QUEUED;
        this.vmLifecycleStatus = VmLifecycleStatus.NOT_STARTED;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getFinalDestinationUrl() {
        return finalDestinationUrl;
    }

    public void setFinalDestinationUrl(String finalDestinationUrl) {
        this.finalDestinationUrl = finalDestinationUrl;
    }

    public String getOriginalDecodedContent() {
        return originalDecodedContent;
    }

    public void setOriginalDecodedContent(String originalDecodedContent) {
        this.originalDecodedContent = originalDecodedContent;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public boolean isHttps() {
        return isHttps;
    }

    public void setHttps(boolean https) {
        isHttps = https;
    }

    public boolean isHasRedirects() {
        return hasRedirects;
    }

    public void setHasRedirects(boolean hasRedirects) {
        this.hasRedirects = hasRedirects;
    }

    public int getRedirectCount() {
        return redirectCount;
    }

    public void setRedirectCount(int redirectCount) {
        this.redirectCount = redirectCount;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public RiskCategory getRiskCategory() {
        return riskCategory;
    }

    public void setRiskCategory(RiskCategory riskCategory) {
        this.riskCategory = riskCategory;
    }

    public ScanStatus getStatus() {
        return status;
    }

    public void setStatus(ScanStatus status) {
        this.status = status;
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

    public String getVmName() {
        return vmName;
    }

    public void setVmName(String vmName) {
        this.vmName = vmName;
    }

    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }

    public String getCleanupStatus() {
        return cleanupStatus;
    }

    public void setCleanupStatus(String cleanupStatus) {
        this.cleanupStatus = cleanupStatus;
    }

    public String getPageTitle() {
        return pageTitle;
    }

    public void setPageTitle(String pageTitle) {
        this.pageTitle = pageTitle;
    }

    public Integer getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(Integer httpStatus) {
        this.httpStatus = httpStatus;
    }

    public String getWarningSigns() {
        return warningSigns;
    }

    public void setWarningSigns(String warningSigns) {
        this.warningSigns = warningSigns;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public String getSecurityFindingsJson() {
        return securityFindingsJson;
    }

    public void setSecurityFindingsJson(String securityFindingsJson) {
        this.securityFindingsJson = securityFindingsJson;
    }

    public String getRedirectSummaryJson() {
        return redirectSummaryJson;
    }

    public void setRedirectSummaryJson(String redirectSummaryJson) {
        this.redirectSummaryJson = redirectSummaryJson;
    }

    public String getAnalysisDetailsJson() {
        return analysisDetailsJson;
    }

    public void setAnalysisDetailsJson(String analysisDetailsJson) {
        this.analysisDetailsJson = analysisDetailsJson;
    }

    public ScanSource getScanSource() {
        return scanSource;
    }

    public void setScanSource(ScanSource scanSource) {
        this.scanSource = scanSource;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public boolean isDownloadDetected() {
        return downloadDetected;
    }

    public void setDownloadDetected(boolean downloadDetected) {
        this.downloadDetected = downloadDetected;
    }

    public String getDownloadArtifactsJson() {
        return downloadArtifactsJson;
    }

    public void setDownloadArtifactsJson(String downloadArtifactsJson) {
        this.downloadArtifactsJson = downloadArtifactsJson;
    }

    public String getLimitationsJson() {
        return limitationsJson;
    }

    public void setLimitationsJson(String limitationsJson) {
        this.limitationsJson = limitationsJson;
    }
}
