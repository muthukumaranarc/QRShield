package com.qrshield.backend.blocklist;

import java.time.LocalDateTime;

public class BlockedDomainResponse {

    private String id;
    private String domain;
    private String reason;
    private LocalDateTime blockedAt;

    public BlockedDomainResponse() {}

    public BlockedDomainResponse(BlockedDomain entity) {
        this.id = entity.getId();
        this.domain = entity.getDomain();
        this.reason = entity.getReason();
        this.blockedAt = entity.getBlockedAt();
    }

    public BlockedDomainResponse(String id, String domain, String reason, LocalDateTime blockedAt) {
        this.id = id;
        this.domain = domain;
        this.reason = reason;
        this.blockedAt = blockedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public LocalDateTime getBlockedAt() {
        return blockedAt;
    }

    public void setBlockedAt(LocalDateTime blockedAt) {
        this.blockedAt = blockedAt;
    }
}
