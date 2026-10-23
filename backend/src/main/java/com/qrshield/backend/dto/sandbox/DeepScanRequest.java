package com.qrshield.backend.dto.sandbox;

import com.qrshield.backend.entity.ScanSource;
import jakarta.validation.constraints.Size;

public class DeepScanRequest {

    @Size(max = 2048, message = "URL cannot exceed 2048 characters")
    private String url;

    private ScanSource source = ScanSource.MANUAL_URL;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public DeepScanRequest() {}

    public DeepScanRequest(String url) {
        this.url = url;
    }

    public DeepScanRequest(String url, ScanSource source) {
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
        return source;
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
