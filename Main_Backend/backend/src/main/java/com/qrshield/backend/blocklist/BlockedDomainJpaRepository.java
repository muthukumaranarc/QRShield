package com.qrshield.backend.blocklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedDomainJpaRepository extends JpaRepository<BlockedDomain, String> {

    List<BlockedDomain> findByUserIdOrderByBlockedAtDesc(String userId);

    Optional<BlockedDomain> findByUserIdAndDomainIgnoreCase(String userId, String domain);

    boolean existsByUserIdAndDomainIgnoreCase(String userId, String domain);

    void deleteByIdAndUserId(String id, String userId);

    Optional<BlockedDomain> findByIdAndUserId(String id, String userId);
}
