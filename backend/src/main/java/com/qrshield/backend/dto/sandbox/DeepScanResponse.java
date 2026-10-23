package com.qrshield.backend.dto.sandbox;

import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanLifecycleStatus;
import com.qrshield.backend.entity.ScanStatus;
import com.qrshield.backend.entity.VmLifecycleStatus;
import com.qrshield.backend.malware.DownloadArtifact;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DeepScanResponse {

    private String scanId;
    private String originalDecodedContent;
    private String initialUrl;
    private String finalDestinationUrl;
    private String domain;
    private String providerName;
    private String ipAddress;
    private String protocol;
    private String pageTitle;
    private Integer httpStatus;
    private boolean isHttps;
    private boolean hasRedirects;
    private int redirectCount;
    private List<String> redirectChain = new ArrayList<>();
    private int riskScore;
    private RiskCategory riskCategory;
    private ScanStatus status;
    private ScanLifecycleStatus lifecycleStatus;
    private VmLifecycleStatus vmLifecycleStatus;
    private List<SecurityFindingDto> findings = new ArrayList<>();
    private List<String> warningSigns = new ArrayList<>();
    private List<String> recommendations = new ArrayList<>();
    private String plainEnglishSummary;
    private String recommendedAction;
    private Long executionDurationMs;
    private String vmName;
    private String cleanupStatus;
    private String errorMessage;
    private boolean downloadDetected;
    private List<DownloadArtifact> downloadArtifacts = new ArrayList<>();
    private List<String> limitations = new ArrayList<>();
    private LocalDateTime scannedAt;
    private LocalDateTime completedAt;

    public DeepScanResponse() {}

    public boolean isDownloadDetected() {
        return downloadDetected;
    }

    public void setDownloadDetected(boolean downloadDetected) {
        this.downloadDetected = downloadDetected;
    }

    public List<DownloadArtifact> getDownloadArtifacts() {
        return downloadArtifacts;
    }

    public void setDownloadArtifacts(List<DownloadArtifact> downloadArtifacts) {
        this.downloadArtifacts = downloadArtifacts;
    }

    public List<String> getLimitations() {
        return limitations;
    }

    public void setLimitations(List<String> limitations) {
        this.limitations = limitations;
    }

    public String getScanId() {
        return scanId;
    }

    public void setScanId(String scanId) {
        this.scanId = scanId;
    }

    public String getOriginalDecodedContent() {
        return originalDecodedContent;
    }

    public void setOriginalDecodedContent(String originalDecodedContent) {
        this.originalDecodedContent = originalDecodedContent;
    }

    public String getInitialUrl() {
        return initialUrl;
    }

    public void setInitialUrl(String initialUrl) {
        this.initialUrl = initialUrl;
    }

    public String getFinalDestinationUrl() {
        return finalDestinationUrl;
    }

    public void setFinalDestinationUrl(String finalDestinationUrl) {
        this.finalDestinationUrl = finalDestinationUrl;
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

    public List<String> getRedirectChain() {
        return redirectChain;
    }

    public void setRedirectChain(List<String> redirectChain) {
        this.redirectChain = redirectChain;
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

    public List<SecurityFindingDto> getFindings() {
        return findings;
    }

    public void setFindings(List<SecurityFindingDto> findings) {
        this.findings = findings;
    }

    public List<String> getWarningSigns() {
        return warningSigns;
    }

    public void setWarningSigns(List<String> warningSigns) {
        this.warningSigns = warningSigns;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public String getPlainEnglishSummary() {
        return plainEnglishSummary;
    }

    public void setPlainEnglishSummary(String plainEnglishSummary) {
        this.plainEnglishSummary = plainEnglishSummary;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }

    public String getVmName() {
        return vmName;
    }

    public void setVmName(String vmName) {
        this.vmName = vmName;
    }

    public String getCleanupStatus() {
        return cleanupStatus;
    }

    public void setCleanupStatus(String cleanupStatus) {
        this.cleanupStatus = cleanupStatus;
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
}
