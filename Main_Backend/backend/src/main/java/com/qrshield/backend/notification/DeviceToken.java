package com.qrshield.backend.notification;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "device_tokens", indexes = {
        @Index(name = "idx_device_token", columnList = "device_token", unique = true),
        @Index(name = "idx_token_user_id", columnList = "user_id")
})
public class DeviceToken {

    @Id
    @Column(name = "id", length = 32, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "device_token", length = 512, nullable = false, unique = true)
    private String deviceToken;

    @Column(name = "platform", length = 32)
    private String platform;

    @Column(name = "allow_security_alerts", nullable = false)
    private boolean allowSecurityAlerts = true;

    @Column(name = "allow_weekly_summary", nullable = false)
    private boolean allowWeeklySummary = true;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public DeviceToken() {
        this.id = "dt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        this.registeredAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public DeviceToken(String userId, String deviceToken, String platform, boolean allowSecurityAlerts, boolean allowWeeklySummary) {
        this();
        this.userId = userId;
        this.deviceToken = deviceToken;
        this.platform = platform != null ? platform.toUpperCase() : "ANDROID";
        this.allowSecurityAlerts = allowSecurityAlerts;
        this.allowWeeklySummary = allowWeeklySummary;
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

    public boolean isAllowSecurityAlerts() {
        return allowSecurityAlerts;
    }

    public void setAllowSecurityAlerts(boolean allowSecurityAlerts) {
        this.allowSecurityAlerts = allowSecurityAlerts;
    }

    public boolean isAllowWeeklySummary() {
        return allowWeeklySummary;
    }

    public void setAllowWeeklySummary(boolean allowWeeklySummary) {
        this.allowWeeklySummary = allowWeeklySummary;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
