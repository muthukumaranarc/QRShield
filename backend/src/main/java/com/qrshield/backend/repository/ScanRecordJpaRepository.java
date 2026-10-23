package com.qrshield.backend.repository;

import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanLifecycleStatus;
import com.qrshield.backend.entity.ScanRecord;
import com.qrshield.backend.entity.ScanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScanRecordJpaRepository extends JpaRepository<ScanRecord, String> {

    List<ScanRecord> findAllByOrderByScannedAtDesc();

    List<ScanRecord> findTop10ByOrderByScannedAtDesc();

    List<ScanRecord> findByRiskCategoryOrderByScannedAtDesc(RiskCategory riskCategory);

    List<ScanRecord> findByLifecycleStatusOrderByScannedAtDesc(ScanLifecycleStatus lifecycleStatus);

    @Query("SELECT r FROM ScanRecord r WHERE LOWER(r.originalUrl) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.domain) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.providerName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY r.scannedAt DESC")
    List<ScanRecord> searchRecords(@Param("query") String query);

    @Query("SELECT r FROM ScanRecord r WHERE r.riskCategory = :category AND (" +
           "LOWER(r.originalUrl) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.domain) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.providerName) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY r.scannedAt DESC")
    List<ScanRecord> searchRecordsWithCategory(@Param("query") String query, @Param("category") RiskCategory category);

    long countByRiskCategory(RiskCategory riskCategory);

    long countByStatus(ScanStatus status);

    long countByLifecycleStatus(ScanLifecycleStatus lifecycleStatus);

    List<ScanRecord> findByLifecycleStatusInAndScannedAtBefore(List<ScanLifecycleStatus> statuses, LocalDateTime threshold);
}
