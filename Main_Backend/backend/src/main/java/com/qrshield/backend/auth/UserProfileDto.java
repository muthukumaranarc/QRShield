package com.qrshield.backend.auth;

import java.time.LocalDateTime;

public class UserProfileDto {

    private String id;
    private String name;
    private String email;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public UserProfileDto() {}

    public UserProfileDto(String id, String name, String email, String avatarUrl, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }

    public UserProfileDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.avatarUrl = user.getAvatarUrl();
            this.createdAt = user.getCreatedAt();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
