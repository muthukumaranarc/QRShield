package com.qrshield.backend.blocklist;

import jakarta.validation.constraints.NotBlank;

public class AddBlockedDomainRequest {

    @NotBlank(message = "Domain cannot be blank")
    private String domain;

    private String reason;

    public AddBlockedDomainRequest() {}

    public AddBlockedDomainRequest(String domain, String reason) {
        this.domain = domain;
        this.reason = reason;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
