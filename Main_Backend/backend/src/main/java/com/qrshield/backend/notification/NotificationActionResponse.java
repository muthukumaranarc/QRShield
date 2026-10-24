package com.qrshield.backend.notification;

public class NotificationActionResponse {

    private boolean success;
    private String message;

    public NotificationActionResponse() {}

    public NotificationActionResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
