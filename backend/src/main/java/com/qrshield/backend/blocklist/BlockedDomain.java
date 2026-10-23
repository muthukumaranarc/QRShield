package com.qrshield.backend.blocklist;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "blocked_domains", indexes = {
        @Index(name = "idx_blocked_user_id", columnList = "user_id"),
        @Index(name = "idx_blocked_domain", columnList = "domain")
})
public class BlockedDomain {

    @Id
    @Column(name = "id", length = 32, nullable = false, updatable = false)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "domain", length = 255, nullable = false)
    private String domain;

    @Column(name = "reason", length = 512)
    private String reason;

    @Column(name = "blocked_at", nullable = false)
    private LocalDateTime blockedAt;

    public BlockedDomain() {
        this.id = generateId();
        this.blockedAt = LocalDateTime.now();
    }

    public BlockedDomain(String userId, String domain, String reason) {
        this.id = generateId();
        this.userId = userId;
        this.domain = cleanDomain(domain);
        this.reason = reason;
        this.blockedAt = LocalDateTime.now();
    }

    private static String generateId() {
        return "b_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private static String cleanDomain(String rawDomain) {
        if (rawDomain == null) return "";
        String domain = rawDomain.trim().toLowerCase();
        if (domain.startsWith("https://")) {
            domain = domain.substring(8);
        } else if (domain.startsWith("http://")) {
            domain = domain.substring(7);
        }
        int slashIdx = domain.indexOf('/');
        if (slashIdx != -1) {
            domain = domain.substring(0, slashIdx);
        }
        int colonIdx = domain.indexOf(':');
        if (colonIdx != -1) {
            domain = domain.substring(0, colonIdx);
        }
        return domain;
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

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = cleanDomain(domain);
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
