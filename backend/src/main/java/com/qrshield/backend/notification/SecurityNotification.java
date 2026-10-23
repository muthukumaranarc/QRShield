package com.qrshield.backend.notification;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "security_notifications", indexes = {
        @Index(name = "idx_notif_created_at", columnList = "created_at"),
        @Index(name = "idx_notif_user_id", columnList = "user_id")
})
public class SecurityNotification {

    @Id
    @Column(name = "id", length = 32, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "message", length = 2048, nullable = false)
    private String message;

    @Column(name = "type", length = 64, nullable = false)
    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public SecurityNotification() {
        this.id = "notif_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        this.createdAt = LocalDateTime.now();
    }

    public SecurityNotification(String id, String userId, String title, String message, String type, boolean read, LocalDateTime createdAt) {
        this.id = id != null ? id : ("notif_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type != null ? type : "SECURITY_WARNING";
        this.read = read;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
