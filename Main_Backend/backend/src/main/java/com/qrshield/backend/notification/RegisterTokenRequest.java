package com.qrshield.backend.notification;

import jakarta.validation.constraints.NotBlank;

public class RegisterTokenRequest {

    @NotBlank(message = "deviceToken cannot be blank")
    private String deviceToken;

    private String platform; // "ANDROID" or "IOS"

    private Boolean allowSecurityAlerts = true;

    private Boolean allowWeeklySummary = true;

    public RegisterTokenRequest() {}

    public RegisterTokenRequest(String deviceToken, String platform, Boolean allowSecurityAlerts, Boolean allowWeeklySummary) {
        this.deviceToken = deviceToken;
        this.platform = platform;
        this.allowSecurityAlerts = allowSecurityAlerts != null ? allowSecurityAlerts : true;
        this.allowWeeklySummary = allowWeeklySummary != null ? allowWeeklySummary : true;
    }

    public String getDeviceToken() {
        return deviceToken;
    }

    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public Boolean getAllowSecurityAlerts() {
        return allowSecurityAlerts;
    }

    public void setAllowSecurityAlerts(Boolean allowSecurityAlerts) {
        this.allowSecurityAlerts = allowSecurityAlerts;
    }

    public Boolean getAllowWeeklySummary() {
        return allowWeeklySummary;
    }

    public void setAllowWeeklySummary(Boolean allowWeeklySummary) {
        this.allowWeeklySummary = allowWeeklySummary;
    }
}
