# QRShield Mobile Backend — New Endpoints Implementation Report

**Generated Date:** October 23, 2026  
**Module:** QRShield Mobile App Integration Backend  
**Status:** IMPLEMENTED & VERIFIED (Build Success, 13/13 New Tests Passed)

---

## 1. Executive Summary

To support all screens and interactive capabilities in the QRShield mobile app, **11 new REST API endpoints** across **4 critical functional domains** were implemented, secured, tested, and integrated:

1. **User Authentication & Profile Management** (5 endpoints) — Connects `LoginScreen`, `SignUpScreen`, and `ProfileScreen`. Provides user isolation, PBKDF2 password hashing with per-user salt, and signed HMAC-SHA256 JWT tokens.
2. **User Custom Blocklist Management** (3 endpoints) — Connects `BlockedAccountsScreen`. Allows users to maintain personal domain blocklists with automatic domain normalization.
3. **Crowdsourced Threat & False Positive Reporting** (1 endpoint) — Connects `AnalysisDetailsScreen` and `ResultScreen`. Enables user reports for scam QR codes and false positive disputes.
4. **Push Notifications & Threat Alerts** (2 endpoints) — Connects `NotificationsScreen` and `NotificationSettingsScreen`. Manages Expo / FCM push tokens and broadcasts critical security advisories.

---

## 2. Endpoints Summary Matrix

| # | HTTP Method | Endpoint URL | Domain | Mobile Screen | Auth Required |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **1** | `POST` | `/api/auth/register` | Authentication | `SignUpScreen` | No |
| **2** | `POST` | `/api/auth/login` | Authentication | `LoginScreen` | No |
| **3** | `POST` | `/api/auth/google` | Authentication | `LoginScreen` / `SignUpScreen` | No |
| **4** | `GET` | `/api/user/profile` | User Profile | `ProfileScreen` | **Yes** (Bearer) |
| **5** | `PUT` | `/api/user/profile` | User Profile | `ProfileScreen` | **Yes** (Bearer) |
| **6** | `GET` | `/api/user/blocked-domains` | Custom Blocklist | `BlockedAccountsScreen` | Optional (Bearer) |
| **7** | `POST` | `/api/user/blocked-domains` | Custom Blocklist | `BlockedAccountsScreen` | Optional (Bearer) |
| **8** | `DELETE` | `/api/user/blocked-domains/{id}` | Custom Blocklist | `BlockedAccountsScreen` | Optional (Bearer) |
| **9** | `POST` | `/api/scan/report` | Threat Intel Reporting | `AnalysisDetailsScreen` / `ResultScreen` | Optional (Bearer) |
| **10** | `POST` | `/api/notifications/register-token` | Push Notifications | `NotificationSettingsScreen` | Optional (Bearer) |
| **11** | `GET` | `/api/notifications` | Security Advisories | `NotificationsScreen` | Optional (Bearer) |

---

## 3. Detailed Endpoint Reports

### Domain 1: User Authentication & Profile Management

#### 3.1. `POST /api/auth/register`
* **Purpose:** Register a new user account with cryptographic password hashing (PBKDF2-HMAC-SHA256, 65,536 iterations, unique 16-byte random salt) and issue a signed JWT.
* **Sample Request:**
  ```http
  POST /api/auth/register HTTP/1.1
  Host: localhost:8080
  Content-Type: application/json

  {
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Sample Response (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1Xzk4MWEyZjRjIiwiZW1haWwiOiJhbGV4LmpvaG5zb25AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWxleCBKb2huc29uIiwiaWF0IjoxNzYxMjQ4MDAwLCJleHAiOjE3NjM4NDAwMDB9.signature",
    "user": {
      "id": "u_981a2f4c",
      "name": "Alex Johnson",
      "email": "alex.johnson@example.com",
      "avatarUrl": null,
      "createdAt": "2026-10-23T20:00:00"
    }
  }
  ```

#### 3.2. `POST /api/auth/login`
* **Purpose:** Authenticate credentials against salt & hash, returning a 30-day JWT Bearer token upon success.
* **Sample Request:**
  ```http
  POST /api/auth/login HTTP/1.1
  Host: localhost:8080
  Content-Type: application/json

  {
    "email": "alex.johnson@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Sample Response (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1Xzk4MWEyZjRjIiwiZW1haWwiOiJhbGV4LmpvaG5zb25AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWxleCBKb2huc29uIiwiaWF0IjoxNzYxMjQ4MDAwLCJleHAiOjE3NjM4NDAwMDB9.signature",
    "user": {
      "id": "u_981a2f4c",
      "name": "Alex Johnson",
      "email": "alex.johnson@example.com",
      "avatarUrl": null,
      "createdAt": "2026-10-23T20:00:00"
    }
  }
  ```

#### 3.3. `POST /api/auth/google`
* **Purpose:** Mobile Google Sign-In with Google OAuth ID token. Verifies email/identity and automatically creates or logs into the account.
* **Sample Request:**
  ```http
  POST /api/auth/google HTTP/1.1
  Host: localhost:8080
  Content-Type: application/json

  {
    "idToken": "ya29.a0AfH6SM..."
  }
  ```
* **Sample Response (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u_981a2f4c",
      "name": "Alex Johnson",
      "email": "alex.johnson@example.com",
      "avatarUrl": "https://lh3.googleusercontent.com/a/default-user=s96-c",
      "createdAt": "2026-10-23T20:00:00"
    }
  }
  ```

#### 3.4. `GET /api/user/profile`
* **Purpose:** Retrieve the profile and account details for the authenticated user.
* **Headers:** `Authorization: Bearer <token>`
* **Sample Response (`200 OK`):**
  ```json
  {
    "id": "u_981a2f4c",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "avatarUrl": "https://example.com/avatar.png",
    "createdAt": "2026-10-23T20:00:00"
  }
  ```

#### 3.5. `PUT /api/user/profile`
* **Purpose:** Update user display name and profile avatar image URL.
* **Headers:** `Authorization: Bearer <token>`
* **Sample Request:**
  ```json
  {
    "name": "Alex Johnson",
    "avatarUrl": "https://example.com/new-avatar.png"
  }
  ```
* **Sample Response (`200 OK`):**
  ```json
  {
    "id": "u_981a2f4c",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "avatarUrl": "https://example.com/new-avatar.png",
    "createdAt": "2026-10-23T20:00:00"
  }
  ```

---

### Domain 2: User Blocked Domains Management

#### 3.6. `GET /api/user/blocked-domains`
* **Purpose:** Fetch all domain blacklist entries saved by the logged-in user.
* **Headers:** `Authorization: Bearer <token>` (Optional)
* **Sample Response (`200 OK`):**
  ```json
  [
    {
      "id": "b_1a2b3c",
      "domain": "phishing-bank-alerts.com",
      "reason": "Phishing SMS scam",
      "blockedAt": "2026-10-23T14:30:00"
    }
  ]
  ```

#### 3.7. `POST /api/user/blocked-domains`
* **Purpose:** Add a domain to the user's personal blocklist. Automatically strips schemes (`https://`, `http://`) and trailing URL paths.
* **Headers:** `Authorization: Bearer <token>` (Optional)
* **Sample Request:**
  ```json
  {
    "domain": "https://malicious-giftcards.xyz/promo/claim",
    "reason": "Fake promotional flyer"
  }
  ```
* **Sample Response (`201 Created`):**
  ```json
  {
    "id": "b_9f4e2d",
    "domain": "malicious-giftcards.xyz",
    "reason": "Fake promotional flyer",
    "blockedAt": "2026-10-23T21:40:00"
  }
  ```

#### 3.8. `DELETE /api/user/blocked-domains/{id}`
* **Purpose:** Unblock a domain and remove the record from the database.
* **Headers:** `Authorization: Bearer <token>` (Optional)
* **Sample Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Domain unblocked successfully"
  }
  ```

---

### Domain 3: Crowdsourced Threat & False Positive Reporting

#### 3.9. `POST /api/scan/report`
* **Purpose:** Allows users to submit suspicious links or dispute false positive detections from the scan result screen.
* **Sample Request:**
  ```json
  {
    "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
    "targetUrl": "https://deceptive-login.net",
    "reportType": "FALSE_NEGATIVE",
    "comments": "The QR code was glued over a legitimate parking meter sticker."
  }
  ```
* **Sample Response (`200 OK`):**
  ```json
  {
    "reportId": "rep_90184b2",
    "status": "RECEIVED",
    "message": "Thank you for reporting. Our threat intelligence team has queued this destination for review."
  }
  ```

---

### Domain 4: Push Notifications & Threat Alerts

#### 3.10. `POST /api/notifications/register-token`
* **Purpose:** Registers the mobile device's Expo / FCM push token and alert preferences.
* **Sample Request:**
  ```json
  {
    "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "platform": "ANDROID",
    "allowSecurityAlerts": true,
    "allowWeeklySummary": true
  }
  ```
* **Sample Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Push token registered successfully"
  }
  ```

#### 3.11. `GET /api/notifications`
* **Purpose:** Fetches the list of active security bulletins and scam warnings to populate the user's notification inbox.
* **Sample Response (`200 OK`):**
  ```json
  [
    {
      "id": "notif_001",
      "title": "New QR Phishing Wave Detected",
      "message": "Fake parking meter QR codes have been reported across metropolitan areas. Always verify payment domains.",
      "type": "SECURITY_WARNING",
      "read": false,
      "createdAt": "2026-10-23T18:00:00"
    },
    {
      "id": "notif_002",
      "title": "Compromised Shortlink Redirects",
      "message": "Phishing actors are abusing bit.ly and tinyurl redirection chains to conceal malicious credential harvest forms.",
      "type": "CRITICAL_ALERT",
      "read": false,
      "createdAt": "2026-10-22T12:00:00"
    }
  ]
  ```

---

## 4. Database Schema Additions (`schema-mysql.sql`)

The following 5 tables were added to support the new domains:

```sql
-- 1. User Authentication & Profiles
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
);

-- 2. User Custom Blocked Domains
CREATE TABLE IF NOT EXISTS blocked_domains (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    reason VARCHAR(512) NULL,
    blocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_blocked_user_id (user_id),
    INDEX idx_blocked_domain (domain)
);

-- 3. Crowdsourced Threat Reports
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
);

-- 4. Mobile Device Push Tokens
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
);

-- 5. Security Advisories & Bulletins
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
);
```

---

## 5. Verification & Test Execution Results

All 13 new unit and integration tests written specifically for these 4 controllers and services passed with zero failures:

```
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.qrshield.backend.auth.AuthControllerTest
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0 - in com.qrshield.backend.auth.AuthControllerTest
Running com.qrshield.backend.blocklist.BlocklistControllerTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 - in com.qrshield.backend.blocklist.BlocklistControllerTest
Running com.qrshield.backend.notification.NotificationControllerTest
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 - in com.qrshield.backend.notification.NotificationControllerTest
Running com.qrshield.backend.reporting.ThreatReportControllerTest
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 - in com.qrshield.backend.reporting.ThreatReportControllerTest

Results:
Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Full repository test suite also verified: **59 tests passed, 0 failures, 0 errors**.
