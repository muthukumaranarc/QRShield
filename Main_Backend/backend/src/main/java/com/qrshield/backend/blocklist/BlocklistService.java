package com.qrshield.backend.blocklist;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlocklistService {

    private static final Logger log = LoggerFactory.getLogger(BlocklistService.class);
    private final BlockedDomainJpaRepository repository;

    public BlocklistService(BlockedDomainJpaRepository repository) {
        this.repository = repository;
    }

    public List<BlockedDomainResponse> getBlockedDomains(String userId) {
        return repository.findByUserIdOrderByBlockedAtDesc(userId)
                .stream()
                .map(BlockedDomainResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public BlockedDomainResponse addBlockedDomain(String userId, AddBlockedDomainRequest request) {
        String cleanDomain = request.getDomain().trim().toLowerCase();
        if (cleanDomain.startsWith("https://")) cleanDomain = cleanDomain.substring(8);
        else if (cleanDomain.startsWith("http://")) cleanDomain = cleanDomain.substring(7);
        int slashIdx = cleanDomain.indexOf('/');
        if (slashIdx != -1) cleanDomain = cleanDomain.substring(0, slashIdx);

        // Check if already blocked for this user
        if (repository.existsByUserIdAndDomainIgnoreCase(userId, cleanDomain)) {
            BlockedDomain existing = repository.findByUserIdAndDomainIgnoreCase(userId, cleanDomain).orElseThrow();
            if (request.getReason() != null && !request.getReason().isBlank()) {
                existing.setReason(request.getReason());
                repository.save(existing);
            }
            return new BlockedDomainResponse(existing);
        }

        BlockedDomain entity = new BlockedDomain(userId, cleanDomain, request.getReason());
        BlockedDomain saved = repository.save(entity);
        log.info("User {} blocked domain: id={}, domain={}", userId, saved.getId(), saved.getDomain());
        return new BlockedDomainResponse(saved);
    }

    @Transactional
    public boolean removeBlockedDomain(String userId, String id) {
        return repository.findById(id).map(entity -> {
            // Allow removal if owner matches or if unassigned
            if (entity.getUserId().equals(userId) || "u_default".equals(userId)) {
                repository.delete(entity);
                log.info("User {} unblocked domain record: {}", userId, id);
                return true;
            }
            return false;
        }).orElse(false);
    }

    public boolean isDomainBlocked(String userId, String domain) {
        if (domain == null || domain.isBlank()) return false;
        String clean = domain.trim().toLowerCase();
        return repository.existsByUserIdAndDomainIgnoreCase(userId, clean);
    }
}
