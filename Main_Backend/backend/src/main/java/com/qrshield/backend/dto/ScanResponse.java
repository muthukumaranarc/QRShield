package com.qrshield.backend.dto;

import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanSource;
import com.qrshield.backend.entity.ScanStatus;
import com.qrshield.backend.malware.DownloadArtifact;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ScanResponse {

    private String id;
    private String originalUrl;
    private String finalDestinationUrl;
    private String domain;
    private String providerName;
    private String ipAddress;
    private String protocol;
    private boolean isHttps;
    private boolean hasRedirects;
    private int redirectCount;
    private List<String> redirectChain = new ArrayList<>();
    private int riskScore;
    private RiskCategory riskCategory;
    private ScanStatus status;
    private List<String> warningSigns = new ArrayList<>();
    private List<String> securityRecommendations = new ArrayList<>();
    private Map<String, Object> details = new HashMap<>();
    private ScanSource scanSource;
    private String notes;
    private boolean downloadDetected;
    private List<DownloadArtifact> downloadArtifacts = new ArrayList<>();
    private List<String> limitations = new ArrayList<>();
    private LocalDateTime scannedAt;

    public ScanResponse() {
    }

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

    public List<String> getWarningSigns() {
        return warningSigns;
    }

    public void setWarningSigns(List<String> warningSigns) {
        this.warningSigns = warningSigns;
    }

    public List<String> getSecurityRecommendations() {
        return securityRecommendations;
    }

    public void setSecurityRecommendations(List<String> securityRecommendations) {
        this.securityRecommendations = securityRecommendations;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
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
