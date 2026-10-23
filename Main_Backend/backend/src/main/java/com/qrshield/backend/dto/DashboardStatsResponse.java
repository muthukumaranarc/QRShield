package com.qrshield.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class DashboardStatsResponse {

    private long totalScans;
    private long lowRiskCount;
    private long mediumRiskCount;
    private long highRiskCount;
    private long unverifiedCount;
    private double safePercentage;
    private List<ScanResponse> recentScans = new ArrayList<>();

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalScans, long lowRiskCount, long mediumRiskCount, long highRiskCount, long unverifiedCount) {
        this.totalScans = totalScans;
        this.lowRiskCount = lowRiskCount;
        this.mediumRiskCount = mediumRiskCount;
        this.highRiskCount = highRiskCount;
        this.unverifiedCount = unverifiedCount;
        this.safePercentage = totalScans > 0 ? Math.round(((double) lowRiskCount / totalScans * 100.0) * 10.0) / 10.0 : 0.0;
    }

    public long getTotalScans() {
        return totalScans;
    }

    public void setTotalScans(long totalScans) {
        this.totalScans = totalScans;
    }

    public long getLowRiskCount() {
        return lowRiskCount;
    }

    public void setLowRiskCount(long lowRiskCount) {
        this.lowRiskCount = lowRiskCount;
    }

    public long getMediumRiskCount() {
        return mediumRiskCount;
    }

    public void setMediumRiskCount(long mediumRiskCount) {
        this.mediumRiskCount = mediumRiskCount;
    }

    public long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(long highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public long getUnverifiedCount() {
        return unverifiedCount;
    }

    public void setUnverifiedCount(long unverifiedCount) {
        this.unverifiedCount = unverifiedCount;
    }

    public double getSafePercentage() {
        return safePercentage;
    }

    public void setSafePercentage(double safePercentage) {
        this.safePercentage = safePercentage;
    }

    public List<ScanResponse> getRecentScans() {
        return recentScans;
    }

    public void setRecentScans(List<ScanResponse> recentScans) {
        this.recentScans = recentScans;
    }
}
