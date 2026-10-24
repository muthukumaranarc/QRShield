# QRShield - Backend (Spring Boot)

QRShield is a mobile-based cybersecurity application designed to protect users from malicious QR codes and suspicious URLs before opening them. 

This backend service receives decoded URLs (or uploaded QR images) from the mobile/web frontend, analyzes their destination domains, performs provider identification, executes a multi-layered cybersecurity risk assessment, and manages scan history and security statistics.

---

## 🚀 Key Features

1. **Intelligent URL Cybersecurity Analysis**:
   - **Provider & Infrastructure Detection**: Identifies hosting providers, cloud CDNs (Google, AWS, Cloudflare, Azure, Vercel, Netlify, etc.), registrars, or shorteners.
   - **Brand Impersonation & Typosquatting**: Employs Levenshtein distance and character replacement analysis (`0` ↔ `o`, `1` ↔ `l`, etc.) against high-profile target brands (PayPal, Google, Microsoft, Apple, Banking apps, etc.).
   - **Abused TLD Detection**: Flags high-risk top-level domains commonly linked to spam and phishing campaigns (`.xyz`, `.top`, `.tk`, `.click`, `.buzz`, `.cam`, etc.).
   - **Obfuscation & Shortener Detection**: Recognizes services like `bit.ly`, `tinyurl.com`, `t.co`, and safely traces redirect chains to uncover the final hidden destination without executing malicious payloads.
   - **Raw IP Hostname Detection**: Flags URLs that target raw IP addresses directly instead of registered domains.
   - **Shannon Entropy Analysis**: Detects algorithmically generated domains (DGA) used by malware and disposable phishing infrastructure.
   - **Dangerous File Payload Alerts**: Blocks links targeting binary and script downloads (`.exe`, `.apk`, `.vbs`, `.bat`, etc.).
   - **Credential & Phishing Keywords**: Flags suspicious parameters (`login`, `verify`, `banking`, `password`, `account-suspended`, etc.).
   - **Clear Limitation Notice**: If a domain cannot be resolved or reached, QRShield issues a prominent limitation warning rather than falsely marking the link as safe.
   - **Financial / UPI Detection**: Detects `upi://`, `gpay://`, and `phonepe://` transactions and extracts payee VPA and merchant details.

2. **QR Code Image Decoding (ZXing Integration)**:
   - Provides `POST /api/scan/qr-image` allowing users to upload QR images directly from their gallery or camera roll.

3. **Scan History & Dashboard Analytics**:
   - Search and filter scans by risk category (`LOW`, `MEDIUM`, `HIGH`) and text query.
   - Dashboard statistics endpoint with risk distributions, safety percentages, and recent scans.
   - Scalable cloud persistence using **MongoDB Atlas** with Spring Data MongoDB.

4. **Cross-Origin Resource Sharing (CORS)**:
   - Configured to allow seamless connection from mobile apps (Flutter, React Native, Android) and web frontends.

---

## 🛠️ Technology Stack

- **Language**: Java 21 / 25 LTS
- **Framework**: Spring Boot 4.x / 3.x (Spring Web, Spring Data MongoDB, Spring Validation)
- **Database**: MongoDB Atlas (Cloud NoSQL Database via `.env` configuration)
- **Environment Management**: `io.github.cdimascio:dotenv-java`
- **QR Decoding**: Google ZXing (Zebra Crossing) 3.5.3
- **Build Tool**: Apache Maven (via bundled `mvnw.cmd` wrapper)
- **Testing**: JUnit 5, Mockito, Spring Boot Test, MockMvc

---

## 📁 Project Structure

```
QRShield/
├── README.md
└── backend/
    ├── pom.xml
    ├── mvnw / mvnw.cmd
    ├── src/
    │   ├── main/
    │   │   ├── java/com/qrshield/backend/
    │   │   │   ├── QrshieldBackendApplication.java
    │   │   │   ├── config/
    │   │   │   │   └── CorsConfig.java
    │   │   │   ├── controller/
    │   │   │   │   ├── UrlScanController.java
    │   │   │   │   ├── HealthController.java
    │   │   │   │   └── GlobalExceptionHandler.java
    │   │   │   ├── dto/
    │   │   │   │   ├── ScanRequest.java
    │   │   │   │   ├── ScanResponse.java
    │   │   │   │   └── DashboardStatsResponse.java
    │   │   │   ├── entity/
    │   │   │   │   ├── ScanRecord.java
    │   │   │   │   ├── RiskCategory.java
    │   │   │   │   ├── ScanStatus.java
    │   │   │   │   └── ScanSource.java
    │   │   │   ├── repository/
    │   │   │   │   └── ScanRecordRepository.java
    │   │   │   └── service/
    │   │   │       ├── UrlAnalysisService.java
    │   │   │       ├── ScanHistoryService.java
    │   │   │       └── QrCodeDecodeService.java
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    │       └── java/com/qrshield/backend/
    │           ├── QrshieldBackendApplicationTests.java
    │           ├── controller/UrlScanControllerTest.java
    │           └── service/UrlAnalysisServiceTest.java
```

---

## ⚙️ How to Run the Backend

### 1. Configure MongoDB Atlas in `.env`
Open the [.env](file:///c:/Users/ELCOT/Documents/git/QRShield/backend/.env) file (located in `backend/.env` or root `.env`) and paste your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/qrshield?retryWrites=true&w=majority
PORT=8080
```

### 2. Start the Server
Open a terminal in the project directory:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
The server will start on port `8080`:
```
Started QrshieldBackendApplication on port 8080 (http)
```

### 3. Run Tests
```bash
cd backend
.\mvnw.cmd test
```

---

## 📡 REST API Documentation

### 1. Analyze URL
- **Endpoint**: `POST /api/scan/analyze`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "url": "http://paypa1-secure-verification.xyz/login.exe",
  "source": "QR_CODE",
  "notes": "Scanned from suspicious sticker"
}
```
- **Response**:
```json
{
  "id": 1,
  "originalUrl": "http://paypa1-secure-verification.xyz/login.exe",
  "finalDestinationUrl": "http://paypa1-secure-verification.xyz/login.exe",
  "domain": "paypa1-secure-verification.xyz",
  "providerName": "Independent / Generic Host",
  "ipAddress": "Unresolved",
  "protocol": "HTTP",
  "https": false,
  "hasRedirects": false,
  "redirectCount": 0,
  "redirectChain": [
    "http://paypa1-secure-verification.xyz/login.exe"
  ],
  "riskScore": 100,
  "riskCategory": "HIGH",
  "status": "DANGEROUS",
  "warningSigns": [
    "Unencrypted HTTP Protocol: Link does not use HTTPS encryption.",
    "High-Risk TLD (.xyz): This domain extension has an abnormally high statistical correlation with malicious spam.",
    "Suspected Brand Impersonation / Typosquatting: Domain appears to counterfeit popular brand 'PAYPAL'.",
    "Direct Executable / Malware Payload Download Detected (.exe)...",
    "LIMITATION NOTICE: QRShield cannot reach or verify this domain..."
  ],
  "securityRecommendations": [
    "DO NOT OPEN THIS LINK. It poses a high cybersecurity threat.",
    "DO NOT input any credentials, passwords, credit card numbers, or OTP codes.",
    "Navigate to the legitimate service by manually typing the official website address in your browser."
  ],
  "scanSource": "QR_CODE",
  "scannedAt": "2026-10-23T14:54:16.873"
}
```

---

### 2. Decode & Analyze QR Image
- **Endpoint**: `POST /api/scan/qr-image`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Image file (PNG, JPG, WEBP)
  - `notes` *(optional)*: Additional context

---

### 3. Get Scan History
- **Endpoint**: `GET /api/scan/history`
- **Query Parameters**:
  - `category` *(optional)*: `LOW`, `MEDIUM`, or `HIGH`
  - `search` *(optional)*: Search query matching URL, domain, or provider name

---

### 4. Get Dashboard Statistics
- **Endpoint**: `GET /api/scan/stats`
- **Response**:
```json
{
  "totalScans": 24,
  "lowRiskCount": 18,
  "mediumRiskCount": 4,
  "highRiskCount": 2,
  "unverifiedCount": 1,
  "safePercentage": 75.0,
  "recentScans": [...]
}
```

---

### 5. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "UP",
  "service": "QRShield Backend Cybersecurity API",
  "version": "1.0.0"
}
```
