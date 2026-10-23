package com.qrshield.backend.notification;

import java.time.LocalDateTime;

public class NotificationItemResponse {

    private String id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationItemResponse() {}

    public NotificationItemResponse(SecurityNotification entity) {
        this.id = entity.getId();
        this.title = entity.getTitle();
        this.message = entity.getMessage();
        this.type = entity.getType();
        this.read = entity.isRead();
        this.createdAt = entity.getCreatedAt();
    }

    public NotificationItemResponse(String id, String title, String message, String type, boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
