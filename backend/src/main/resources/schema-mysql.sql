-- =========================================================================
-- QRShield Cybersecurity Engine - MySQL Database Schema
-- Table: scan_records
-- =========================================================================

CREATE DATABASE IF NOT EXISTS qrshield CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qrshield;

CREATE TABLE IF NOT EXISTS scan_records (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    original_url VARCHAR(2048) NULL,
    final_destination_url VARCHAR(2048) NULL,
    original_decoded_content VARCHAR(4096) NULL,
    domain VARCHAR(255) NULL,
    provider_name VARCHAR(255) NULL,
    ip_address VARCHAR(128) NULL,
    protocol VARCHAR(32) NULL,
    is_https BOOLEAN DEFAULT FALSE,
    has_redirects BOOLEAN DEFAULT FALSE,
    redirect_count INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    risk_category VARCHAR(32) NULL,
    status VARCHAR(32) NULL,
    lifecycle_status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
    vm_lifecycle_status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    vm_name VARCHAR(128) NULL,
    execution_duration_ms BIGINT NULL,
    cleanup_status VARCHAR(64) NULL,
    page_title VARCHAR(512) NULL,
    http_status INT NULL,
    warning_signs TEXT NULL,
    recommendations TEXT NULL,
    security_findings_json TEXT NULL,
    redirect_summary_json TEXT NULL,
    analysis_details_json TEXT NULL,
    download_detected BOOLEAN DEFAULT FALSE,
    download_artifacts_json TEXT NULL,
    limitations_json TEXT NULL,
    scan_source VARCHAR(32) NULL,
    notes VARCHAR(1024) NULL,
    error_message VARCHAR(2048) NULL,
    scanned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    
    INDEX idx_scan_domain (domain),
    INDEX idx_scan_risk_category (risk_category),
    INDEX idx_scan_scanned_at (scanned_at),
    INDEX idx_scan_lifecycle_status (lifecycle_status),
    INDEX idx_scan_vm_status (vm_lifecycle_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- User Authentication & Profiles
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    salt VARCHAR(128) NULL,
    avatar_url VARCHAR(1024) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- User Custom Blocked Domains (BlockedAccountsScreen)
-- =========================================================================
CREATE TABLE IF NOT EXISTS blocked_domains (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    reason VARCHAR(512) NULL,
    blocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_blocked_user_id (user_id),
    INDEX idx_blocked_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- Crowdsourced Threat & False Positive Reporting
-- =========================================================================
CREATE TABLE IF NOT EXISTS threat_reports (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    scan_id VARCHAR(64) NULL,
    target_url VARCHAR(2048) NOT NULL,
    report_type VARCHAR(64) NOT NULL,
    comments VARCHAR(2048) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
    reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_report_target_url (target_url(255)),
    INDEX idx_report_type (report_type),
    INDEX idx_report_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- Mobile Device Push Tokens (NotificationsScreen)
-- =========================================================================
CREATE TABLE IF NOT EXISTS device_tokens (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    device_token VARCHAR(512) NOT NULL UNIQUE,
    platform VARCHAR(32) DEFAULT 'ANDROID',
    allow_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    allow_weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_token_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- Security Advisories & Bulletins Inbox
-- =========================================================================
CREATE TABLE IF NOT EXISTS security_notifications (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(2048) NOT NULL,
    type VARCHAR(64) NOT NULL DEFAULT 'SECURITY_WARNING',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notif_created_at (created_at),
    INDEX idx_notif_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
