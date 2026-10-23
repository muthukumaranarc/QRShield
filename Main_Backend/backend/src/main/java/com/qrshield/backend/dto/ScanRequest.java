package com.qrshield.backend.dto;

import com.qrshield.backend.entity.ScanSource;
import jakarta.validation.constraints.NotBlank;

public class ScanRequest {

    @NotBlank(message = "URL cannot be blank")
    private String url;

    private ScanSource source = ScanSource.QR_CODE;

    private String notes;

    public ScanRequest() {
    }

    public ScanRequest(String url) {
        this.url = url;
    }

    public ScanRequest(String url, ScanSource source) {
        this.url = url;
        this.source = source;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public ScanSource getSource() {
        return source != null ? source : ScanSource.QR_CODE;
    }

    public void setSource(ScanSource source) {
        this.source = source;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
