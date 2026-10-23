package com.qrshield.backend.reporting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreatReportJpaRepository extends JpaRepository<ThreatReport, String> {

    List<ThreatReport> findByTargetUrlOrderByReportedAtDesc(String targetUrl);

    List<ThreatReport> findByScanId(String scanId);

    List<ThreatReport> findByUserIdOrderByReportedAtDesc(String userId);
}
