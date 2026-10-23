# QRShield API Endpoints Reference Guide

**Base URL:** `http://localhost:8080`  
**API Prefix:** `/api`  
**Content-Type:** `application/json` (unless specified as `multipart/form-data`)

---

## 1. Endpoints Overview

| # | HTTP Method | Endpoint URL | Purpose / Use Case |
| :-: | :--- | :--- | :--- |
| **1** | `GET` | `/api/health` | System health check and API operational status. |
| **2** | `POST` | `/api/scan/analyze` | Fast static heuristic analysis of a URL pre-click. |
| **3** | `POST` | `/api/scan/qr-image` | Upload QR image, decode embedded URL, and perform static analysis. |
| **4** | `POST` | `/api/scan/deep-analysis` | Submit URL for isolated VM sandbox inspection & malware download detection. |
| **5** | `POST` | `/api/scan/deep-analysis/qr-image` | Upload QR image, decode URL, and enqueue for deep sandbox analysis. |
| **6** | `GET` | `/api/scan/{scanId}/status` | Poll asynchronous lifecycle status/progress of a deep sandbox job. |
| **7** | `GET` | `/api/scan/{scanId}` | Fetch complete deep scan results, sandbox observations, and download artifacts. |
| **8** | `GET` | `/api/scan/history` | Retrieve historical scan logs with optional risk filtering and search. |
| **9** | `GET` | `/api/scan/history/{id}` | Retrieve details of an individual historical scan record. |
| **10** | `DELETE` | `/api/scan/history/{id}` | Delete a single scan record from the database. |
| **11** | `DELETE` | `/api/scan/history` | Clear all historical scan records from the database. |
| **12** | `GET` | `/api/scan/stats` | Retrieve dashboard threat analytics and risk breakdown statistics. |
| **13** | `GET` | `/api/scan/admin/scans` | Admin view of all executed deep sandbox scans. |
| **14** | `POST` | `/api/auth/register` | Register a new user account with email and password. |
| **15** | `POST` | `/api/auth/login` | Authenticate an existing user and issue a JWT token. |
| **16** | `POST` | `/api/auth/google` | Authenticate with a Google OAuth ID token for one-tap sign-in. |
| **17** | `GET` | `/api/user/profile` | Retrieve current authenticated user profile details. |
| **18** | `PUT` | `/api/user/profile` | Update profile information (name, avatar URL). |
| **19** | `GET` | `/api/user/blocked-domains` | Retrieve all custom domains blocked by the user. |
| **20** | `POST` | `/api/user/blocked-domains` | Add a domain to the user's personal blocklist. |
| **21** | `DELETE` | `/api/user/blocked-domains/{id}` | Remove a domain from the user's blocklist (unblock). |
| **22** | `POST` | `/api/scan/report` | Submit crowdsourced scam reports or dispute false positives. |
| **23** | `POST` | `/api/notifications/register-token` | Register mobile device Expo/FCM push token with the server. |
| **24** | `GET` | `/api/notifications` | Retrieve security advisories, scam alerts, and bulletins inbox. |

---

## 2. Detailed Endpoint Specifications

### 2.1. System Health Check
* **Endpoint:** `GET /api/health`
* **Purpose:** Verifies that the Spring Boot backend server is running and provides engine capability metadata.

#### Sample Request
```http
GET /api/health HTTP/1.1
Host: localhost:8080
Accept: application/json
```

#### Sample Response (`200 OK`)
```json
{
  "status": "UP",
  "service": "QRShield Backend Cybersecurity API",
  "version": "1.0.0",
  "timestamp": "2026-10-23T20:30:15.123",
  "engine": "Heuristic + Threat Intel + Provider Identification"
}
```

---

### 2.2. Static URL Pre-Click Analysis
* **Endpoint:** `POST /api/scan/analyze`
* **Purpose:** Performs fast, pre-click heuristic threat evaluation (checking domain age, deceptive brand keywords, multiple redirect hops, protocol safety, and provider identification) without opening a browser. Automatically persists the result to scan history.

#### Sample Request
```http
POST /api/scan/analyze HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "url": "https://paypa1-security-update.xyz/login",
  "source": "MANUAL_URL",
  "notes": "Suspicious SMS link"
}
```

#### Sample Response (`200 OK`)
```json
{
  "id": "e7b1a23c-5890-449e-b811-9f7d6a501a4e",
  "originalUrl": "https://paypa1-security-update.xyz/login",
  "finalDestinationUrl": "https://paypa1-security-update.xyz/login",
  "domain": "paypa1-security-update.xyz",
  "providerName": "Unknown / Suspicious Hosting",
  "ipAddress": "198.51.100.42",
  "protocol": "https",
  "https": true,
  "hasRedirects": false,
  "redirectCount": 0,
  "redirectChain": [
    "https://paypa1-security-update.xyz/login"
  ],
  "riskScore": 85,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "warningSigns": [
    "Deceptive domain mimicking legitimate brand 'paypal'",
    "High-risk top level domain (.xyz)",
    "Domain contains high-risk credential keywords: login, security"
  ],
  "securityRecommendations": [
    "DO NOT open this link or enter personal credentials.",
    "Report this domain to your security operations team.",
    "Block this URL in your organization's firewall/DNS gateway."
  ],
  "scanSource": "MANUAL_URL",
  "notes": "Suspicious SMS link",
  "downloadDetected": false,
  "downloadArtifacts": [],
  "limitations": [],
  "scannedAt": "2026-10-23T20:31:00"
}
```

---

### 2.3. QR Code Image Decode & Static Scan
* **Endpoint:** `POST /api/scan/qr-image`
* **Purpose:** Accepts an uploaded QR code image (PNG, JPG, etc.), extracts the encoded URL using ZXing decoder, runs the static security analysis, and saves the scan record.

#### Sample Request
```http
POST /api/scan/qr-image HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="parking_meter_qr.png"
Content-Type: image/png

<binary image data>
------WebKitFormBoundary
Content-Disposition: form-data; name="notes"

Physical QR sticker found on parking meter
------WebKitFormBoundary--
```

#### Sample Response (`200 OK`)
```json
{
  "id": "c1f88e1a-4933-4a11-8930-b74681f21bc9",
  "originalUrl": "https://legitimate-parking.com/pay",
  "finalDestinationUrl": "https://legitimate-parking.com/pay",
  "domain": "legitimate-parking.com",
  "providerName": "Cloudflare Managed Infrastructure",
  "ipAddress": "104.21.55.19",
  "protocol": "https",
  "https": true,
  "hasRedirects": false,
  "redirectCount": 0,
  "riskScore": 10,
  "riskCategory": "LOW",
  "status": "SAFE",
  "warningSigns": [],
  "securityRecommendations": [
    "Verify the URL matches official parking signage before authorizing payment."
  ],
  "scanSource": "GALLERY_IMAGE",
  "notes": "Physical QR sticker found on parking meter",
  "downloadDetected": false,
  "downloadArtifacts": [],
  "limitations": [],
  "scannedAt": "2026-10-23T20:31:45"
}
```

---

### 2.4. Enqueue Deep Sandbox Analysis
* **Endpoint:** `POST /api/scan/deep-analysis`
* **Purpose:** Initiates a comprehensive dynamic inspection inside an isolated VirtualBox VM running Playwright Chromium. Checks for:
  - Deceptive brand page titles and fake login screens.
  - Hidden password inputs on insecure forms.
  - Foreign form action destinations.
  - Console security errors and invalid TLS certificates.
  - **Browser Download Events:** Captures downloads safely, quarantines them, computes streaming SHA-256, and queries threat intelligence (VirusTotal).
  - **Pre-flight SSRF Protection:** Blocks loopback (`127.0.0.1`), private RFC 1918 subnets, and cloud metadata (`169.254.169.254`).

#### Sample Request
```http
POST /api/scan/deep-analysis HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "url": "https://suspicious-installer.com/setup.exe",
  "source": "MANUAL_URL",
  "notes": "Download verification requested"
}
```

#### Sample Response (`202 Accepted`)
```json
{
  "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
  "status": "QUEUED",
  "message": "Deep sandbox analysis enqueued. Check status at /api/scan/3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456/status"
}
```

---

### 2.5. QR Image Deep Sandbox Analysis
* **Endpoint:** `POST /api/scan/deep-analysis/qr-image`
* **Purpose:** Decodes an uploaded QR code image and immediately enqueues the extracted destination for full dynamic VM sandbox analysis.

#### Sample Request
```http
POST /api/scan/deep-analysis/qr-image HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="qr_flyer.jpg"
Content-Type: image/jpeg

<binary image data>
------WebKitFormBoundary
Content-Disposition: form-data; name="notes"

Flyer scanned at conference
------WebKitFormBoundary--
```

#### Sample Response (`202 Accepted`)
```json
{
  "scanId": "7d91e4ab-2840-4ce0-9833-2ba8c3127df1",
  "decodedContent": "https://conference-update-2026.net/agenda.pdf",
  "status": "QUEUED",
  "message": "QR decoded. Deep sandbox analysis enqueued."
}
```

---

### 2.6. Poll Deep Scan Job Status
* **Endpoint:** `GET /api/scan/{scanId}/status`
* **Purpose:** Used by client applications to poll the progress of an enqueued scan job.

#### Lifecycle Stages
* `QUEUED` (Progress: 10%)
* `STARTING_VM` (Progress: 30%)
* `ANALYZING` (Progress: 60%)
* `FINALIZING` (Progress: 85%)
* `COMPLETED` / `UNVERIFIED` / `FAILED` (Progress: 100%)

#### Sample Request
```http
GET /api/scan/3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456/status HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
{
  "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
  "lifecycleStatus": "ANALYZING",
  "vmLifecycleStatus": "HEALTHY",
  "progressPercentage": 60,
  "statusMessage": "Processing: ANALYZING",
  "scannedAt": "2026-10-23T20:32:00",
  "executionDurationMs": null
}
```

---

### 2.7. Get Complete Deep Scan Result
* **Endpoint:** `GET /api/scan/{scanId}`
* **Purpose:** Fetches the full structured analysis output after a scan finishes. Contains both browser inspection telemetry and malware download artifact findings.

#### Sample Request
```http
GET /api/scan/3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456 HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
{
  "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
  "originalDecodedContent": "https://suspicious-installer.com/setup.exe",
  "initialUrl": "https://suspicious-installer.com/setup.exe",
  "finalDestinationUrl": "https://cdn.suspicious-installer.com/binaries/setup.exe",
  "domain": "suspicious-installer.com",
  "providerName": "Fastly CDN",
  "ipAddress": "151.101.65.140",
  "protocol": "https",
  "pageTitle": "Download Setup",
  "httpStatus": 200,
  "https": true,
  "hasRedirects": true,
  "redirectCount": 1,
  "redirectChain": [
    "https://suspicious-installer.com/setup.exe",
    "https://cdn.suspicious-installer.com/binaries/setup.exe"
  ],
  "riskScore": 100,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "lifecycleStatus": "COMPLETED",
  "vmLifecycleStatus": "DELETED",
  "vmName": "qrshield-worker-3a0fe90e",
  "cleanupStatus": "PURGED_AND_UNREGISTERED",
  "findings": [
    {
      "code": "MALICIOUS_DOWNLOAD_CONFIRMED",
      "severity": "CRITICAL",
      "description": "Downloaded file matched confirmed malware signature (SHA-256: 275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f)",
      "category": "MALWARE"
    }
  ],
  "warningSigns": [
    "Confirmed malware download detected: File hash identified as malicious by threat intelligence."
  ],
  "recommendations": [
    "CRITICAL: Do not open or run any files from this site. The destination dropped confirmed malware."
  ],
  "plainEnglishSummary": "Malware threat detected! The site initiates an automatic download of a file confirmed as malicious by threat intelligence.",
  "recommendedAction": "DO NOT OPEN THIS LINK. Block and report to your cybersecurity team immediately.",
  "downloadDetected": true,
  "downloadArtifacts": [
    {
      "artifactId": "8f3ab184-b049-4180-87a2-1e967d7195c6",
      "analysisId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
      "sourceUrl": "https://cdn.suspicious-installer.com/binaries/setup.exe",
      "redirectChain": [
        "https://suspicious-installer.com/setup.exe",
        "https://cdn.suspicious-installer.com/binaries/setup.exe"
      ],
      "finalUrl": "https://cdn.suspicious-installer.com/binaries/setup.exe",
      "originalFilename": "setup.exe",
      "contentType": "application/octet-stream",
      "sizeBytes": 68240,
      "sha256": "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
      "quarantineStatus": "QUARANTINED",
      "reputationStatus": "CONFIRMED_MALICIOUS",
      "findings": [
        {
          "providerName": "MockThreatIntel",
          "status": "CONFIRMED_MALICIOUS",
          "message": "Confirmed malicious file signature in signature database.",
          "checkedAt": "2026-10-23T20:32:14"
        }
      ],
      "limitations": [
        "The file was quarantined and was not executed.",
        "No known hash match does not establish that the file is safe."
      ],
      "createdAt": "2026-10-23T20:32:12"
    }
  ],
  "limitations": [
    "The file was quarantined and was not executed.",
    "No known hash match does not establish that the file is safe."
  ],
  "executionDurationMs": 14250,
  "scannedAt": "2026-10-23T20:32:00",
  "completedAt": "2026-10-23T20:32:14"
}
```

---

### 2.8. Retrieve Scan History
* **Endpoint:** `GET /api/scan/history`
* **Purpose:** Returns past scan records. Supports optional filtering by `category` (`LOW`, `MEDIUM`, `HIGH`) and keyword `search`.

#### Query Parameters
* `category` *(optional)*: `LOW` | `MEDIUM` | `HIGH`
* `search` *(optional)*: Search string matching domain or original URL

#### Sample Request
```http
GET /api/scan/history?category=HIGH&search=paypal HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
[
  {
    "id": "e7b1a23c-5890-449e-b811-9f7d6a501a4e",
    "originalUrl": "https://paypa1-security-update.xyz/login",
    "finalDestinationUrl": "https://paypa1-security-update.xyz/login",
    "domain": "paypa1-security-update.xyz",
    "riskScore": 85,
    "riskCategory": "HIGH",
    "status": "DANGEROUS",
    "scannedAt": "2026-10-23T20:31:00"
  }
]
```

---

### 2.9. Retrieve Historical Scan by ID
* **Endpoint:** `GET /api/scan/history/{id}`
* **Purpose:** Retrieves the full stored record for a past scan using its UUID.

#### Sample Request
```http
GET /api/scan/history/e7b1a23c-5890-449e-b811-9f7d6a501a4e HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
{
  "id": "e7b1a23c-5890-449e-b811-9f7d6a501a4e",
  "originalUrl": "https://paypa1-security-update.xyz/login",
  "domain": "paypa1-security-update.xyz",
  "riskScore": 85,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "warningSigns": [
    "Deceptive domain mimicking legitimate brand 'paypal'"
  ],
  "securityRecommendations": [
    "DO NOT open this link."
  ],
  "scannedAt": "2026-10-23T20:31:00"
}
```

---

### 2.10. Delete a Scan Record
* **Endpoint:** `DELETE /api/scan/history/{id}`
* **Purpose:** Deletes an individual scan record from the database.

#### Sample Request
```http
DELETE /api/scan/history/e7b1a23c-5890-449e-b811-9f7d6a501a4e HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Scan record removed successfully"
}
```

---

### 2.11. Clear All Scan History
* **Endpoint:** `DELETE /api/scan/history`
* **Purpose:** Purges all scan history entries from database storage.

#### Sample Request
```http
DELETE /api/scan/history HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "All scan history cleared"
}
```

---

### 2.12. Dashboard Threat Analytics
* **Endpoint:** `GET /api/scan/stats`
* **Purpose:** Provides aggregate analytics for frontend dashboards, including total scans, safe vs. suspicious vs. dangerous counts, and risk distribution.

#### Sample Request
```http
GET /api/scan/stats HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
{
  "totalScans": 48,
  "safeScans": 30,
  "suspiciousScans": 11,
  "dangerousScans": 7,
  "highRiskCount": 7,
  "mediumRiskCount": 11,
  "lowRiskCount": 30,
  "averageRiskScore": 28.5,
  "recentScans": [
    {
      "id": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
      "originalUrl": "https://suspicious-installer.com/setup.exe",
      "riskScore": 100,
      "riskCategory": "HIGH",
      "status": "DANGEROUS",
      "scannedAt": "2026-10-23T20:32:00"
    }
  ]
}
```

---

### 2.13. Admin Scans Overview
* **Endpoint:** `GET /api/scan/admin/scans`
* **Purpose:** Returns a list of all historical deep sandbox scans with their detailed lifecycle states, VM cleanup statuses, and download artifacts.

#### Sample Request
```http
GET /api/scan/admin/scans HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
```json
[
  {
    "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
    "initialUrl": "https://suspicious-installer.com/setup.exe",
    "riskScore": 100,
    "riskCategory": "HIGH",
    "status": "DANGEROUS",
    "lifecycleStatus": "COMPLETED",
    "vmLifecycleStatus": "DELETED",
    "cleanupStatus": "PURGED_AND_UNREGISTERED",
    "downloadDetected": true,
    "scannedAt": "2026-10-23T20:32:00"
  }
]
```

---

### 2.14. User Registration
* **Endpoint:** `POST /api/auth/register`
* **Purpose:** Create a new user account with email and password. Generates a PBKDF2-hashed password with a cryptographic salt and issues a JWT token.

#### Sample Request
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

#### Sample Response (`201 Created`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1Xzk4MWEyZjRjIiwiZW1haWwiOiJhbGV4LmpvaG5zb25AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWxleCBKb2huc29uIiwiaWF0IjoxNzYxMjQ4MDAwLCJleHAiOjE3NjM4NDAwMDB9.c2lnbmF0dXJl",
  "user": {
    "id": "u_981a2f4c",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "avatarUrl": null,
    "createdAt": "2026-10-23T20:00:00"
  }
}
```

---

### 2.15. User Login
* **Endpoint:** `POST /api/auth/login`
* **Purpose:** Authenticate an existing user with email and password. Verifies hash and issues a signed JWT Bearer token.

#### Sample Request
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "alex.johnson@example.com",
  "password": "SecurePassword123!"
}
```

#### Sample Response (`200 OK`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1Xzk4MWEyZjRjIiwiZW1haWwiOiJhbGV4LmpvaG5zb25AZXhhbXBsZS5jb20iLCJuYW1lIjoiQWxleCBKb2huc29uIiwiaWF0IjoxNzYxMjQ4MDAwLCJleHAiOjE3NjM4NDAwMDB9.c2lnbmF0dXJl",
  "user": {
    "id": "u_981a2f4c",
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "avatarUrl": null,
    "createdAt": "2026-10-23T20:00:00"
  }
}
```

---

### 2.16. Google OAuth One-Tap Sign-In
* **Endpoint:** `POST /api/auth/google`
* **Purpose:** Authenticate or auto-register using a Google OAuth ID token for seamless mobile one-tap sign-in.

#### Sample Request
```http
POST /api/auth/google HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "idToken": "ya29.a0AfH6SM..."
}
```

#### Sample Response (`200 OK`)
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

---

### 2.17. Get User Profile
* **Endpoint:** `GET /api/user/profile`
* **Purpose:** Retrieve the profile details of the authenticated user.
* **Headers:** `Authorization: Bearer <token>`

#### Sample Request
```http
GET /api/user/profile HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response (`200 OK`)
```json
{
  "id": "u_981a2f4c",
  "name": "Alex Johnson",
  "email": "alex.johnson@example.com",
  "avatarUrl": "https://example.com/avatar.png",
  "createdAt": "2026-10-23T20:00:00"
}
```

---

### 2.18. Update User Profile
* **Endpoint:** `PUT /api/user/profile`
* **Purpose:** Update the authenticated user's display name or avatar URL.
* **Headers:** `Authorization: Bearer <token>`

#### Sample Request
```http
PUT /api/user/profile HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Alex Johnson",
  "avatarUrl": "https://example.com/new-avatar.png"
}
```

#### Sample Response (`200 OK`)
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

### 2.19. Get Blocked Domains
* **Endpoint:** `GET /api/user/blocked-domains`
* **Purpose:** Retrieve all personal DNS/domain blacklist entries created by the logged-in user.
* **Headers:** `Authorization: Bearer <token>` (Optional; defaults to user profile)

#### Sample Request
```http
GET /api/user/blocked-domains HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response (`200 OK`)
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

---

### 2.20. Add Blocked Domain
* **Endpoint:** `POST /api/user/blocked-domains`
* **Purpose:** Add a malicious or unwanted domain to the user's personal blocklist. Automatically normalizes domain names (stripping protocols and paths).
* **Headers:** `Authorization: Bearer <token>`

#### Sample Request
```http
POST /api/user/blocked-domains HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "domain": "malicious-giftcards.xyz",
  "reason": "Fake promotional flyer"
}
```

#### Sample Response (`201 Created`)
```json
{
  "id": "b_9f4e2d",
  "domain": "malicious-giftcards.xyz",
  "reason": "Fake promotional flyer",
  "blockedAt": "2026-10-23T21:40:00"
}
```

---

### 2.21. Delete Blocked Domain
* **Endpoint:** `DELETE /api/user/blocked-domains/{id}`
* **Purpose:** Unblock a domain and remove it from the user's personal blacklist.
* **Headers:** `Authorization: Bearer <token>`

#### Sample Request
```http
DELETE /api/user/blocked-domains/b_1a2b3c HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Domain unblocked successfully"
}
```

---

### 2.22. Crowdsourced Threat & False Positive Reporting
* **Endpoint:** `POST /api/scan/report`
* **Purpose:** Allow users on the mobile scan results screen to report newly encountered malicious URLs or dispute false positive detections.

#### Sample Request
```http
POST /api/scan/report HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
  "targetUrl": "https://deceptive-login.net",
  "reportType": "FALSE_NEGATIVE",
  "comments": "The QR code was glued over a legitimate parking meter sticker."
}
```

#### Sample Response (`200 OK`)
```json
{
  "reportId": "rep_90184b2",
  "status": "RECEIVED",
  "message": "Thank you for reporting. Our threat intelligence team has queued this destination for review."
}
```

---

### 2.23. Register Mobile Device Push Token
* **Endpoint:** `POST /api/notifications/register-token`
* **Purpose:** Registers an Expo / FCM push notification token with device platform and alert preferences.

#### Sample Request
```http
POST /api/notifications/register-token HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ANDROID",
  "allowSecurityAlerts": true,
  "allowWeeklySummary": true
}
```

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

---

### 2.24. Retrieve Security Bulletins & Threat Alerts
* **Endpoint:** `GET /api/notifications`
* **Purpose:** Retrieve recent security bulletins, zero-day threat warnings, and system defense advisories for the user's notification inbox.

#### Sample Request
```http
GET /api/notifications HTTP/1.1
Host: localhost:8080
```

#### Sample Response (`200 OK`)
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

## 3. Threat Status & Safety Semantics Reference

### Overall Scan Status (`status`)
* **`SAFE`**: Scored below 35. No deceptive elements, malicious scripts, or unexpected downloads detected.
* **`SUSPICIOUS`**: Scored between 35 and 69, OR any unsolicited file download occurred.
* **`DANGEROUS`**: Scored 70 and above, OR file confirmed malicious by threat intelligence.
* **`UNVERIFIED`**: Dynamic sandbox or download capture could not complete. Uncertainty is explicitly preserved.

### Quarantine Status (`quarantineStatus`)
* **`QUARANTINED`**: File safely captured, stripped of execute bits, and stored under `artifact-<UUID>.quarantine`.
* **`REJECTED_OVERSIZED`**: Download exceeded `QRSHIELD_MAX_DOWNLOAD_BYTES` (default 25 MB) and was purged.
* **`REJECTED_CAPACITY`**: Vault disk usage exceeded `QRSHIELD_QUARANTINE_MAX_BYTES` (default 500 MB).
* **`CAPTURE_FAILED`**: Download aborted due to network timeout, error, or SSRF policy block.
* **`NOT_DOWNLOADED`**: Target page did not trigger a download event.

### Reputation Status (`reputationStatus`)
* **`CONFIRMED_MALICIOUS`**: Positive match in threat intelligence database (e.g. VirusTotal/EICAR).
* **`NO_KNOWN_MATCH`**: Hash was looked up, but no vendor flagged it. **Crucial rule: This is NOT proof of safety.**
* **`UNAVAILABLE`**: Third-party provider outage, missing API key, or rate limit hit.
* **`ERROR`**: Unexpected server/format error during lookup.
* **`NOT_CHECKED`**: Provider lookups disabled in configuration or hash unavailable.
