# 🛡️ QRShield Backend - API Endpoints & Output Report

**Project**: QRShield Cybersecurity Engine  
**Technology**: Java 25 / Spring Boot 4.x / Spring Data MongoDB / MongoDB Atlas / Google ZXing  
**Server Base URL**: `http://localhost:8080`  
**Test Date & Time**: 2026-10-23  

---

## 📋 Table of Contents
1. [Overview](#1-overview)
2. [API Endpoints Quick Reference](#2-api-endpoints-quick-reference)
3. [Endpoint Details & Live Test Outputs](#3-endpoint-details--live-test-outputs)
   - [3.1 System Health Check (`GET /api/health`)](#31-system-health-check-get-apihealth)
   - [3.2 Analyze URL - Safe Link (`POST /api/scan/analyze`)](#32-analyze-url---safe-link-post-apiscananalyze)
   - [3.3 Analyze URL - Phishing / Malware Link (`POST /api/scan/analyze`)](#33-analyze-url---phishing--malware-link-post-apiscananalyze)
   - [3.4 Analyze URL - Financial UPI QR Link (`POST /api/scan/analyze`)](#34-analyze-url---financial-upi-qr-link-post-apiscananalyze)
   - [3.5 Analyze URL - Raw IP Host Link (`POST /api/scan/analyze`)](#35-analyze-url---raw-ip-host-link-post-apiscananalyze)
   - [3.6 Direct QR Code Image Upload (`POST /api/scan/qr-image`)](#36-direct-qr-code-image-upload-post-apiscangr-image)
   - [3.7 Fetch Scan History (`GET /api/scan/history`)](#37-fetch-scan-history-get-apiscanshistory)
   - [3.8 Fetch Single Scan by ID (`GET /api/scan/history/{id}`)](#38-fetch-single-scan-by-id-get-apiscanshistoryid)
   - [3.9 Security Dashboard Statistics (`GET /api/scan/stats`)](#39-security-dashboard-statistics-get-apiscansstats)
   - [3.10 Delete a Scan Record (`DELETE /api/scan/history/{id}`)](#310-delete-a-scan-record-delete-apiscanshistoryid)
   - [3.11 Clear All History (`DELETE /api/scan/history`)](#311-clear-all-history-delete-apiscanshistory)
4. [Cybersecurity Engine Scoring Matrix](#4-cybersecurity-engine-scoring-matrix)

---

## 1. Overview

Frontend (Mobile App / Web) QR code-ஐ scan செய்து decode செய்த பிறகு கிடைக்கும் URL-ஐ Backend-க்கு அனுப்பி வைக்கும். Backend-ன் முக்கிய பணிகள்:
1. **Provider Identification**: Hostname, IP address மற்றும் DNS reverse lookup மூலம் Domain Provider (Google, Cloudflare, Microsoft, AWS, Razorpay, Shortener Services) யார் என்பதைக் கண்டறிதல்.
2. **Cybersecurity Risk Assessment (0 - 100)**: Brand typosquatting, URL shortener redirection, suspicious TLDs, dangerous file downloads (.exe, .apk), sensitive phishing keywords, மற்றும் Shannon entropy-ஐ ஆய்வு செய்து Risk Category (`LOW`, `MEDIUM`, `HIGH`) மற்றும் Status (`SAFE`, `SUSPICIOUS`, `DANGEROUS`, `UNVERIFIED`) வழங்குதல்.
3. **Limitation Notice**: Domain unreachable அல்லது DNS resolve ஆகவில்லை எனில், தவறாக 'Safe' என்று காட்டாமல் `UNVERIFIED` என்ற தெளிவான எச்சரிக்கையை வழங்குதல்.
4. **History & Dashboard Analytics**: அனைத்து scan-களையும் H2 Database-ல் சேமித்து, search, filter மற்றும் summary statistics தருதல்.

---

## 2. API Endpoints Quick Reference

| Method | Endpoint | Request Body / Params | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | None | Service uptime மற்றும் status சரிபார்க்க |
| `POST` | `/api/scan/analyze` | JSON `{ url, source, notes }` | URL-ஐ analyze செய்து provider, risk score, warnings தர |
| `POST` | `/api/scan/qr-image` | Multipart `file` (image) | Gallery-லிருந்து QR code படம் upload செய்து scan செய்ய |
| `GET` | `/api/scan/history` | `?category=...&search=...` | Scan history-ஐ filter செய்து பெற |
| `GET` | `/api/scan/history/{id}` | Path variable `id` | குறிப்பிட்ட scan விவரங்களைப் பெற |
| `DELETE` | `/api/scan/history/{id}` | Path variable `id` | ஒரு scan record-ஐ நீக்க |
| `DELETE` | `/api/scan/history` | None | மொத்த scan history-ஐ அழிக்க |
| `GET` | `/api/scan/stats` | None | Dashboard statistics (total, low, medium, high) பெற |

---

## 3. Endpoint Details & Live Test Outputs

### 3.1 System Health Check (`GET /api/health`)

Backend சேவை சரியாக இயங்குகிறதா என்பதை சரிபார்க்கும் எளிய endpoint.

- **Request**:
```bash
curl -X GET http://localhost:8080/api/health
```

- **Live Output**:
```json
{
  "engine": "Heuristic + Threat Intel + Provider Identification",
  "timestamp": "2026-10-23T15:08:00.374970300",
  "version": "1.0.0",
  "status": "UP",
  "service": "QRShield Backend Cybersecurity API"
}
```

---

### 3.2 Analyze URL - Safe Link (`POST /api/scan/analyze`)

நம்பகமான, பாதுகாப்பான நிறுவன URL-ஐ (`https://www.google.com`) scan செய்யும் போது கிடைக்கும் output.

- **Request**:
```bash
curl -X POST http://localhost:8080/api/scan/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com",
    "source": "QR_CODE",
    "notes": "Legitimate company QR code"
  }'
```

- **Live Output**:
```json
{
  "id": 1,
  "originalUrl": "https://www.google.com",
  "finalDestinationUrl": "https://www.google.com",
  "domain": "www.google.com",
  "providerName": "Google LLC / Alphabet Inc.",
  "ipAddress": "142.251.157.119",
  "protocol": "HTTPS",
  "https": true,
  "hasRedirects": false,
  "redirectCount": 0,
  "redirectChain": [
    "https://www.google.com"
  ],
  "riskScore": 0,
  "riskCategory": "LOW",
  "status": "SAFE",
  "warningSigns": [
    "No significant cybersecurity threats or deceptive patterns detected."
  ],
  "securityRecommendations": [
    "URL appears safe based on domain reputation and heuristic indicators.",
    "Always maintain standard vigilance and verify the SSL padlock icon in your browser."
  ],
  "details": {
    "canonicalHost": "maa03s47-in-f4.1e100.net",
    "usesHttps": true,
    "subdomainCount": 1,
    "dnsResolved": true,
    "isUrlShortener": false,
    "resolvedIp": "142.251.157.119",
    "reputableDomain": true,
    "domainEntropy": 2.86,
    "isSuspiciousTld": false,
    "tld": "com",
    "isIpHost": false
  },
  "scanSource": "QR_CODE",
  "notes": "Legitimate company QR code",
  "scannedAt": "2026-10-23T15:08:25.185974"
}
```

---

### 3.3 Analyze URL - Phishing / Malware Link (`POST /api/scan/analyze`)

PayPal நிறுவனத்தைப் போல போலியாக உருவாக்கப்பட்ட (`paypa1-account-security.xyz`), unencrypted HTTP மற்றும் `.exe` file download link கொண்ட malicious URL.

- **Request**:
```bash
curl -X POST http://localhost:8080/api/scan/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://paypa1-account-security.xyz/login.exe",
    "source": "QR_CODE",
    "notes": "Suspicious public sticker"
  }'
```

- **Live Output**:
```json
{
  "id": 2,
  "originalUrl": "http://paypa1-account-security.xyz/login.exe",
  "finalDestinationUrl": "http://paypa1-account-security.xyz/login.exe",
  "domain": "paypa1-account-security.xyz",
  "providerName": "Independent / Generic Host",
  "ipAddress": "Unresolved",
  "protocol": "HTTP",
  "https": false,
  "hasRedirects": false,
  "redirectCount": 0,
  "redirectChain": [
    "http://paypa1-account-security.xyz/login.exe"
  ],
  "riskScore": 100,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "warningSigns": [
    "DNS lookup failed: Domain does not exist or DNS records have been revoked/expired. Server is unreachable.",
    "Unencrypted HTTP Protocol: Link does not use HTTPS encryption. Traffic can be eavesdropped, altered, or intercepted via Man-in-the-Middle (MitM) attacks.",
    "High-Risk TLD (.xyz): This domain extension has an abnormally high statistical correlation with malicious spam, credential harvesting, and scam campaigns.",
    "Suspected Brand Impersonation / Typosquatting: Domain appears to counterfeit popular brand 'PAYPAL' using character replacement, spelling variations, or brand injection.",
    "High Character Entropy (3.93): Domain name appears to be randomly or algorithmically generated (frequently used in malware command & control or disposable phishing links).",
    "Suspicious Security & Credential Keywords Found: [login]. Typical of fake login portals and phishing landing pages.",
    "Direct Executable / Malware Payload Download Detected (.exe): Link immediately attempts to download or execute binary code on the client machine.",
    "LIMITATION NOTICE: QRShield cannot reach or verify this domain. Host could not be resolved or server is offline. This link cannot be certified as safe."
  ],
  "securityRecommendations": [
    "DO NOT OPEN THIS LINK. It poses a high cybersecurity threat.",
    "DO NOT input any credentials, passwords, credit card numbers, or OTP codes.",
    "If you received this QR code in a public place or unsolicited message, report it to cybersecurity administrators or the relevant platform.",
    "Navigate to the legitimate service by manually typing the official website address in your browser instead of clicking this link.",
    "Do not accept or run any file downloads prompted by this link."
  ],
  "details": {
    "detectedKeywords": [
      "login"
    ],
    "subdomainCount": 0,
    "dnsResolved": false,
    "highEntropy": true,
    "isSuspiciousTld": true,
    "tld": "xyz",
    "dangerousFileDownload": ".exe",
    "isBrandSpoofing": true,
    "usesHttps": false,
    "isUrlShortener": false,
    "spoofedBrand": "paypal",
    "domainEntropy": 3.93,
    "isIpHost": false
  },
  "scanSource": "QR_CODE",
  "notes": "Suspicious public sticker",
  "scannedAt": "2026-10-23T15:08:32.279506"
}
```

---

### 3.4 Analyze URL - Financial UPI QR Link (`POST /api/scan/analyze`)

கடைகளில் scan செய்யப்படும் UPI கட்டண QR Code (`upi://pay`).

- **Request**:
```bash
curl -X POST http://localhost:8080/api/scan/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "upi://pay?pa=shopkeeper@upi&pn=GroceryStore&am=250.00",
    "source": "QR_CODE",
    "notes": "Store billing QR code"
  }'
```

- **Live Output**:
```json
{
  "id": 3,
  "originalUrl": "upi://pay?pa=shopkeeper@upi&pn=GroceryStore&am=250.00",
  "finalDestinationUrl": null,
  "domain": "UPI Payment Network",
  "providerName": "NPCI / Unified Payments Interface",
  "ipAddress": null,
  "protocol": "UPI / Payment Scheme",
  "https": false,
  "hasRedirects": false,
  "redirectCount": 0,
  "redirectChain": [],
  "riskScore": 25,
  "riskCategory": "LOW",
  "status": "SAFE",
  "warningSigns": [
    "This is an instant financial transaction link (UPI payment request)."
  ],
  "securityRecommendations": [
    "Verify payee VPA (shopkeeper@upi) and merchant name (GroceryStore) before authorizing payment on your mobile UPI app."
  ],
  "details": {
    "payeeName": "GroceryStore",
    "payeeVpa": "shopkeeper@upi",
    "isPaymentLink": true,
    "amount": "250.00"
  },
  "scanSource": "QR_CODE",
  "notes": "Store billing QR code",
  "scannedAt": "2026-10-23T15:08:32.430000"
}
```

---

### 3.5 Analyze URL - Raw IP Host Link (`POST /api/scan/analyze`)

Domain-க்கு பதிலாக நேரடி IP முகவரி மற்றும் login credential keyword கொண்ட link (`http://192.168.1.1/admin/login`).

- **Request**:
```bash
curl -X POST http://localhost:8080/api/scan/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://192.168.1.1/admin/login",
    "source": "MANUAL_URL",
    "notes": "Direct IP link"
  }'
```

- **Live Output**:
```json
{
  "id": 4,
  "originalUrl": "http://192.168.1.1/admin/login",
  "finalDestinationUrl": "http://192.168.1.1/admin/login",
  "domain": "192.168.1.1",
  "providerName": "Independent / Generic Host",
  "ipAddress": "192.168.1.1",
  "protocol": "HTTP",
  "https": false,
  "hasRedirects": false,
  "redirectCount": 0,
  "redirectChain": [
    "http://192.168.1.1/admin/login"
  ],
  "riskScore": 72,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "warningSigns": [
    "Unencrypted HTTP Protocol: Link does not use HTTPS encryption. Traffic can be eavesdropped, altered, or intercepted via Man-in-the-Middle (MitM) attacks.",
    "Raw IP Address Hostname: URL directly targets an IP address (192.168.1.1) instead of a verified registered domain. Legitimate services virtually never use raw IP URLs.",
    "Suspicious Security & Credential Keywords Found: [login]. Typical of fake login portals and phishing landing pages."
  ],
  "securityRecommendations": [
    "DO NOT OPEN THIS LINK. It poses a high cybersecurity threat.",
    "DO NOT input any credentials, passwords, credit card numbers, or OTP codes.",
    "If you received this QR code in a public place or unsolicited message, report it to cybersecurity administrators or the relevant platform."
  ],
  "details": {
    "detectedKeywords": [
      "login"
    ],
    "canonicalHost": "192.168.1.1",
    "usesHttps": false,
    "subdomainCount": 0,
    "dnsResolved": true,
    "isUrlShortener": false,
    "resolvedIp": "192.168.1.1",
    "domainEntropy": 2.47,
    "isSuspiciousTld": false,
    "tld": "1",
    "isIpHost": true
  },
  "scanSource": "MANUAL_URL",
  "notes": "Direct IP link",
  "scannedAt": "2026-10-23T15:08:33.120000"
}
```

---

### 3.6 Direct QR Code Image Upload (`POST /api/scan/qr-image`)

மொபைல் gallery அல்லது camera roll-லிருந்து QR Code புகைப்படத்தை நேரடியாக upload செய்யும் வசதி (Multipart Form Data). Google ZXing இயந்திரம் மூலமாக தானாக decode செய்யப்படும்.

- **Request**:
```bash
curl -X POST http://localhost:8080/api/scan/qr-image \
  -F "file=@qr_sample.png" \
  -F "notes=Uploaded from user gallery"
```

- **Output Format**:
```json
{
  "id": 5,
  "originalUrl": "https://github.com/muthukumaranarc/QRShield",
  "finalDestinationUrl": "https://github.com/muthukumaranarc/QRShield",
  "domain": "github.com",
  "providerName": "GitHub / Microsoft",
  "ipAddress": "20.207.73.82",
  "protocol": "HTTPS",
  "https": true,
  "riskScore": 0,
  "riskCategory": "LOW",
  "status": "SAFE",
  "scanSource": "GALLERY_IMAGE",
  "notes": "Uploaded from user gallery"
}
```

---

### 3.7 Fetch Scan History (`GET /api/scan/history`)

பயனரின் அனைத்து முந்தைய scan-களையும் காலவரிசைப்படி (Latest first) பெறலாம்.

- **Request**:
```bash
# All history:
curl -X GET http://localhost:8080/api/scan/history

# Filter by category:
curl -X GET "http://localhost:8080/api/scan/history?category=HIGH"

# Search keyword:
curl -X GET "http://localhost:8080/api/scan/history?search=paypal"
```

- **Live Output Sample**:
```json
[
  {
    "id": 4,
    "originalUrl": "http://192.168.1.1/admin/login",
    "domain": "192.168.1.1",
    "providerName": "Independent / Generic Host",
    "riskScore": 72,
    "riskCategory": "HIGH",
    "status": "DANGEROUS",
    "scanSource": "MANUAL_URL",
    "scannedAt": "2026-10-23T15:08:33.120000"
  },
  {
    "id": 3,
    "originalUrl": "upi://pay?pa=shopkeeper@upi&pn=GroceryStore&am=250.00",
    "domain": "UPI Payment Network",
    "providerName": "NPCI / Unified Payments Interface",
    "riskScore": 25,
    "riskCategory": "LOW",
    "status": "SAFE",
    "scanSource": "QR_CODE",
    "scannedAt": "2026-10-23T15:08:32.430000"
  },
  {
    "id": 2,
    "originalUrl": "http://paypa1-account-security.xyz/login.exe",
    "domain": "paypa1-account-security.xyz",
    "providerName": "Independent / Generic Host",
    "riskScore": 100,
    "riskCategory": "HIGH",
    "status": "DANGEROUS",
    "scanSource": "QR_CODE",
    "scannedAt": "2026-10-23T15:08:32.279506"
  },
  {
    "id": 1,
    "originalUrl": "https://www.google.com",
    "domain": "www.google.com",
    "providerName": "Google LLC / Alphabet Inc.",
    "riskScore": 0,
    "riskCategory": "LOW",
    "status": "SAFE",
    "scanSource": "QR_CODE",
    "scannedAt": "2026-10-23T15:08:25.185974"
  }
]
```

---

### 3.8 Fetch Single Scan by ID (`GET /api/scan/history/{id}`)

ஒரு குறிப்பிட்ட scan-ன் முழுமையான எச்சரிக்கைகள் மற்றும் பரிந்துரைகளை அறிய:

- **Request**:
```bash
curl -X GET http://localhost:8080/api/scan/history/2
```

- **Live Output**:
```json
{
  "id": 2,
  "originalUrl": "http://paypa1-account-security.xyz/login.exe",
  "domain": "paypa1-account-security.xyz",
  "providerName": "Independent / Generic Host",
  "riskScore": 100,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "warningSigns": [
    "DNS lookup failed: Domain does not exist or DNS records have been revoked/expired. Server is unreachable.",
    "Unencrypted HTTP Protocol: Link does not use HTTPS encryption.",
    "High-Risk TLD (.xyz)...",
    "Suspected Brand Impersonation / Typosquatting: Domain appears to counterfeit popular brand 'PAYPAL'...",
    "Direct Executable / Malware Payload Download Detected (.exe)..."
  ],
  "securityRecommendations": [
    "DO NOT OPEN THIS LINK. It poses a high cybersecurity threat.",
    "DO NOT input any credentials, passwords, credit card numbers, or OTP codes."
  ]
}
```

---

### 3.9 Security Dashboard Statistics (`GET /api/scan/stats`)

Mobile App-ன் Dashboard-க்கு தேவையான மொத்த scan-களின் எண்ணிக்கை, safe percentage, மற்றும் risk வகைப்பாடு சுருக்கம்.

- **Request**:
```bash
curl -X GET http://localhost:8080/api/scan/stats
```

- **Live Output**:
```json
{
  "totalScans": 4,
  "lowRiskCount": 2,
  "mediumRiskCount": 0,
  "highRiskCount": 2,
  "unverifiedCount": 0,
  "safePercentage": 50.0,
  "recentScans": [
    {
      "id": 4,
      "originalUrl": "http://192.168.1.1/admin/login",
      "domain": "192.168.1.1",
      "riskScore": 72,
      "riskCategory": "HIGH",
      "status": "DANGEROUS"
    },
    {
      "id": 3,
      "originalUrl": "upi://pay?pa=shopkeeper@upi&pn=GroceryStore&am=250.00",
      "domain": "UPI Payment Network",
      "riskScore": 25,
      "riskCategory": "LOW",
      "status": "SAFE"
    },
    {
      "id": 2,
      "originalUrl": "http://paypa1-account-security.xyz/login.exe",
      "domain": "paypa1-account-security.xyz",
      "riskScore": 100,
      "riskCategory": "HIGH",
      "status": "DANGEROUS"
    },
    {
      "id": 1,
      "originalUrl": "https://www.google.com",
      "domain": "www.google.com",
      "riskScore": 0,
      "riskCategory": "LOW",
      "status": "SAFE"
    }
  ]
}
```

---

### 3.10 Delete a Scan Record (`DELETE /api/scan/history/{id}`)

குறிப்பிட்ட ஒரு scan record-ஐ நீக்க:

- **Request**:
```bash
curl -X DELETE http://localhost:8080/api/scan/history/4
```

- **Live Output**:
```json
{
  "success": true,
  "message": "Scan record removed successfully"
}
```

---

### 3.11 Clear All History (`DELETE /api/scan/history`)

முழு scan history-ஐயும் அழிக்க:

- **Request**:
```bash
curl -X DELETE http://localhost:8080/api/scan/history
```

- **Live Output**:
```json
{
  "success": true,
  "message": "All scan history cleared"
}
```

---

## 4. Cybersecurity Engine Scoring Matrix

| Indicator / Threat Pattern | Weighted Penalty | Risk Classification |
|---|---|---|
| **Malware / Executable Binary** (`.exe`, `.apk`, `.vbs`, `.bat`) | `+50` | Critical Danger |
| **Brand Impersonation / Typosquatting** (`paypa1`, `goog1e`) | `+45` | Critical Danger |
| **Raw IP Address Host** (`http://192.168.1.1`) | `+45` | Critical Danger |
| **Punycode / Homograph Attack** (`xn--...`) | `+40` | High Danger |
| **Abused / Spam TLD** (`.xyz`, `.top`, `.tk`, `.click`, `.buzz`) | `+30` | Medium Threat |
| **Obfuscated URL Shortener** (`bit.ly`, `tinyurl.com`) | `+25` | Medium Threat |
| **High Shannon Entropy** (Randomized DGA domains > 3.8) | `+20` | Medium Threat |
| **Excessive Subdomain Depth** (Stacking ≥ 3 levels) | `+20` | Medium Threat |
| **Suspicious Phishing Keywords** (`login`, `verify`, `banking`) | `+12 per keyword` | Suspicious |
| **Unencrypted HTTP Connection** (No TLS encryption) | `+15` | Medium Threat |
| **DNS Resolution Failure / Offline Host** | `Sets Base to 45` | **UNVERIFIED Limitation Notice** |
| **Verified Reputable Domain** (Google, Microsoft, GitHub, Apple) | `Trust bound (≤ 10)` | Safe Verified |
