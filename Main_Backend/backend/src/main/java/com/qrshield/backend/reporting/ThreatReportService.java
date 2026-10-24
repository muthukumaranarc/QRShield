package com.qrshield.backend.reporting;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ThreatReportService {

    private static final Logger log = LoggerFactory.getLogger(ThreatReportService.class);
    private final ThreatReportJpaRepository repository;

    public ThreatReportService(ThreatReportJpaRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ThreatReportResponse submitReport(String userId, ThreatReportRequest request) {
        ThreatReport report = new ThreatReport(
                userId,
                request.getScanId(),
                request.getTargetUrl(),
                request.getReportType(),
                request.getComments()
        );

        ThreatReport saved = repository.save(report);
        log.info("User {} submitted threat report: id={}, type={}, url={}",
                userId != null ? userId : "anonymous",
                saved.getId(),
                saved.getReportType(),
                saved.getTargetUrl());

        return new ThreatReportResponse(
                saved.getId(),
                saved.getStatus(),
                "Thank you for reporting. Our threat intelligence team has queued this destination for review."
        );
    }
}
