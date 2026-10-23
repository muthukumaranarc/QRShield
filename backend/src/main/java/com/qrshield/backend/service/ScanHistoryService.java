package com.qrshield.backend.service;

import com.qrshield.backend.dto.DashboardStatsResponse;
import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanRecord;
import com.qrshield.backend.entity.ScanStatus;
import com.qrshield.backend.repository.ScanRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScanHistoryService {

    private final ScanRecordRepository repository;
    private final UrlAnalysisService analysisService;

    public ScanHistoryService(ScanRecordRepository repository, UrlAnalysisService analysisService) {
        this.repository = repository;
        this.analysisService = analysisService;
    }

    public ScanResponse saveScan(ScanResponse response) {
        ScanRecord record = analysisService.toEntity(response);
        ScanRecord saved = repository.save(record);
        response.setId(saved.getId());
        return response;
    }

    public List<ScanResponse> getHistory(RiskCategory category, String query) {
        List<ScanRecord> records;

        if (query != null && !query.trim().isEmpty()) {
            String trimmedQuery = query.trim();
            if (category != null) {
                records = repository.searchRecordsWithCategory(trimmedQuery, category);
            } else {
                records = repository.searchRecords(trimmedQuery);
            }
        } else if (category != null) {
            records = repository.findByRiskCategoryOrderByScannedAtDesc(category);
        } else {
            records = repository.findAllByOrderByScannedAtDesc();
        }

        return records.stream()
                .map(analysisService::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ScanResponse> getScanById(String id) {
        return repository.findById(id).map(analysisService::toDto);
    }

    public boolean deleteScan(String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    public void clearAllHistory() {
        repository.deleteAll();
    }

    public DashboardStatsResponse getDashboardStats() {
        long total = repository.count();
        long low = repository.countByRiskCategory(RiskCategory.LOW);
        long medium = repository.countByRiskCategory(RiskCategory.MEDIUM);
        long high = repository.countByRiskCategory(RiskCategory.HIGH);
        long unverified = repository.countByStatus(ScanStatus.UNVERIFIED);

        DashboardStatsResponse stats = new DashboardStatsResponse(total, low, medium, high, unverified);

        List<ScanResponse> recent = repository.findTop10ByOrderByScannedAtDesc().stream()
                .map(analysisService::toDto)
                .collect(Collectors.toList());

        stats.setRecentScans(recent);
        return stats;
    }
}
