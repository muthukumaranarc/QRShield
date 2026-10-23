package com.qrshield.worker.dto;

import java.util.ArrayList;
import java.util.List;

public class WorkerScanResponse {
    private String scanId;
    private String initialUrl;
    private String finalUrl;
    private String pageTitle;
    private Integer httpStatus;
    private boolean hasRedirects;
    private int redirectCount;
    private List<String> redirectChain = new ArrayList<>();
    private boolean tlsValid = true;
    private String tlsErrorDetails;
    private boolean passwordInputsDetected;
    private List<String> formActionDestinations = new ArrayList<>();
    private List<String> consoleSecurityErrors = new ArrayList<>();
    private List<SecurityFindingDto> findings = new ArrayList<>();
    private Long executionDurationMs;
    private String status;
    private String errorMessage;
    private boolean downloadDetected;
    private String downloadUrl;
    private String downloadFilename;
    private String downloadMimeType;

    public WorkerScanResponse() {}

    public boolean isDownloadDetected() {
        return downloadDetected;
    }

    public void setDownloadDetected(boolean downloadDetected) {
        this.downloadDetected = downloadDetected;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public String getDownloadFilename() {
        return downloadFilename;
    }

    public void setDownloadFilename(String downloadFilename) {
        this.downloadFilename = downloadFilename;
    }

    public String getDownloadMimeType() {
        return downloadMimeType;
    }

    public void setDownloadMimeType(String downloadMimeType) {
        this.downloadMimeType = downloadMimeType;
    }

    public String getScanId() {
        return scanId;
    }

    public void setScanId(String scanId) {
        this.scanId = scanId;
    }

    public String getInitialUrl() {
        return initialUrl;
    }

    public void setInitialUrl(String initialUrl) {
        this.initialUrl = initialUrl;
    }

    public String getFinalUrl() {
        return finalUrl;
    }

    public void setFinalUrl(String finalUrl) {
        this.finalUrl = finalUrl;
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

    public boolean isTlsValid() {
        return tlsValid;
    }

    public void setTlsValid(boolean tlsValid) {
        this.tlsValid = tlsValid;
    }

    public String getTlsErrorDetails() {
        return tlsErrorDetails;
    }

    public void setTlsErrorDetails(String tlsErrorDetails) {
        this.tlsErrorDetails = tlsErrorDetails;
    }

    public boolean isPasswordInputsDetected() {
        return passwordInputsDetected;
    }

    public void setPasswordInputsDetected(boolean passwordInputsDetected) {
        this.passwordInputsDetected = passwordInputsDetected;
    }

    public List<String> getFormActionDestinations() {
        return formActionDestinations;
    }

    public void setFormActionDestinations(List<String> formActionDestinations) {
        this.formActionDestinations = formActionDestinations;
    }

    public List<String> getConsoleSecurityErrors() {
        return consoleSecurityErrors;
    }

    public void setConsoleSecurityErrors(List<String> consoleSecurityErrors) {
        this.consoleSecurityErrors = consoleSecurityErrors;
    }

    public List<SecurityFindingDto> getFindings() {
        return findings;
    }

    public void setFindings(List<SecurityFindingDto> findings) {
        this.findings = findings;
    }

    public Long getExecutionDurationMs() {
        return executionDurationMs;
    }

    public void setExecutionDurationMs(Long executionDurationMs) {
        this.executionDurationMs = executionDurationMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
