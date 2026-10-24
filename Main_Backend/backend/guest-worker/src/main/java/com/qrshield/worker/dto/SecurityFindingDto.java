package com.qrshield.worker.dto;

public class SecurityFindingDto {
    private String code;
    private String severity;
    private String description;
    private String category;

    public SecurityFindingDto() {}

    public SecurityFindingDto(String code, String severity, String description, String category) {
        this.code = code;
        this.severity = severity;
        this.description = description;
        this.category = category;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
