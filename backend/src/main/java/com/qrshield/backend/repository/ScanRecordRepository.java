package com.qrshield.backend.repository;

import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanRecord;
import com.qrshield.backend.entity.ScanStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanRecordRepository extends MongoRepository<ScanRecord, String> {

    List<ScanRecord> findAllByOrderByScannedAtDesc();

    List<ScanRecord> findTop10ByOrderByScannedAtDesc();

    List<ScanRecord> findByRiskCategoryOrderByScannedAtDesc(RiskCategory riskCategory);

    @Query("{ '$or': [ { 'originalUrl': { '$regex': ?0, '$options': 'i' } }, { 'domain': { '$regex': ?0, '$options': 'i' } }, { 'providerName': { '$regex': ?0, '$options': 'i' } } ] }")
    List<ScanRecord> searchRecords(String query);

    @Query("{ 'riskCategory': ?1, '$or': [ { 'originalUrl': { '$regex': ?0, '$options': 'i' } }, { 'domain': { '$regex': ?0, '$options': 'i' } }, { 'providerName': { '$regex': ?0, '$options': 'i' } } ] }")
    List<ScanRecord> searchRecordsWithCategory(String query, RiskCategory category);

    long countByRiskCategory(RiskCategory riskCategory);

    long countByStatus(ScanStatus status);
}
