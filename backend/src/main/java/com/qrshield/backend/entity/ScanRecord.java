package com.qrshield.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "scan_records")
public class ScanRecord {

    @Id
    private String id;

    private String originalUrl;
    private String finalDestinationUrl;

    @Indexed
    private String domain;

    private String providerName;
    private String ipAddress;
    private String protocol;
    private boolean isHttps;
    private boolean hasRedirects;
    private int redirectCount;
    private int riskScore;

    @Indexed
    private RiskCategory riskCategory;

    private ScanStatus status;
    private String warningSigns;
    private String recommendations;
    private String analysisDetailsJson;
    private ScanSource scanSource;
    private String notes;

    @Indexed
    private LocalDateTime scannedAt;

    public ScanRecord() {
        this.scannedAt = LocalDateTime.now();
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

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }
}
