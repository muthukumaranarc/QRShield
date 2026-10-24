# QRShield — Malware Detection & Security Test Report

**Execution Timestamp:** 2026-10-23 19:45:01 IST  
**Environment:** Java 21 | Spring Boot 3.4.2 | Maven Surefire 3.5.6 | Windows 64-bit  
**Module:** `qrshield-backend` (`0.0.1-SNAPSHOT`)  
**Overall Status:** **`BUILD SUCCESS`** — **46 Tests Passed, 0 Failures, 0 Errors, 0 Skipped**

---

## 1. Executive Summary

This report documents the automated test suite results for the **QRShield Download-to-Hash Malware Detection Pipeline** and core cybersecurity engines. The test suite validates strict isolation, quarantine vault boundaries, streaming SHA-256 calculation, threat intelligence reputation semantics, path traversal mitigation, and Server-Side Request Forgery (SSRF) protections.

```
================================================================================
Total Tests Run: 46 | Passed: 46 | Failures: 0 | Errors: 0 | Skipped: 0
Build Status: SUCCESS | Execution Time: 39.77 seconds
================================================================================
```

---

## 2. Test Suite Breakdown by Security Domain

| Test Suite Class | Domain / Component | Tests Run | Passed | Failures | Errors |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **`DownloadCaptureServiceTest`** | Safe Download Stream & SSRF Prevention | 3 | 3 | 0 | 0 |
| **`FileHashServiceTest`** | Streaming SHA-256 Digest & Syntax Validation | 3 | 3 | 0 | 0 |
| **`FileReputationServiceTest`** | Multi-Provider Reputation Coordination | 6 | 6 | 0 | 0 |
| **`QuarantineStorageServiceTest`** | Quarantine Vault, Traversal & Capacity Limits | 6 | 6 | 0 | 0 |
| **`VirusTotalHashProviderTest`** | Hash-Only VirusTotal v3 REST Integration | 3 | 3 | 0 | 0 |
| **`ExplainableRiskEngineTest`** | Explainable Risk Scoring & Malware Integration | 6 | 6 | 0 | 0 |
| **`UrlSecurityValidatorTest`** | Pre-Flight SSRF, Cloud Metadata & IP Filtering | 7 | 7 | 0 | 0 |
| **`UrlAnalysisServiceTest`** | Static Pre-Click Heuristic Threat Analysis | 7 | 7 | 0 | 0 |
| **`UrlScanControllerTest`** | REST API Endpoints & Request Validation | 4 | 4 | 0 | 0 |
| **`QrshieldBackendApplicationTests`** | Spring Application Context Integrity | 1 | 1 | 0 | 0 |
| **Total** | | **46** | **46** | **0** | **0** |

---

## 3. Detailed Verification Results

### 3.1. Quarantine Vault & Filesystem Security (`QuarantineStorageServiceTest`)
* **Path Traversal Rejection (`testPathTraversalBlocked`):** Passed. Blocked relative directory breakout attempts (`../../../Windows/System32/cmd.exe` and `..\..\secret.txt`) with `SecurityException`.
* **Public Directory Guard (`testRejectPublicWebDirectory`):** Passed. System refuses initialization if the quarantine directory resolves into static/public web resources (`src/main/resources/static/`).
* **Non-Executable Permissions (`testSuccessfulQuarantine`):** Passed. Quarantined artifacts are saved with random UUID names (`artifact-<UUID>.quarantine`) and operating system execution permissions are stripped.
* **Oversized Stream Abort (`testRejectOversizedDownload`):** Passed. Streams exceeding `maxDownloadBytes` are interrupted in-flight, disk writes aborted, and partial files purged (`REJECTED_OVERSIZED`).
* **Vault Capacity Ceilings (`testRejectCapacityExceeded`):** Passed. Downloads rejected immediately when aggregate vault storage reaches `quarantineMaxBytes` (`REJECTED_CAPACITY`).
* **Display Sanitization (`testSanitizeDisplayFilename`):** Passed. Untrusted filename headers stripped of control characters, slashes, and traversal sequences before being used as metadata.

### 3.2. Streaming SHA-256 Integrity (`FileHashServiceTest`)
* **Standard NIST Vector (`testEmptyStreamSha256`):** Passed. Empty stream computes exact known digest `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
* **Known Text Vector (`testKnownFileSha256`):** Passed. File on disk computes exact digest for `"hello world"` (`b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9`).
* **Format Syntax Validator (`testSha256Validation`):** Passed. Correctly validates 64-character lowercase/uppercase hex strings and rejects truncated or invalid characters.

### 3.3. Threat Reputation & Safety Semantics (`FileReputationServiceTest` & `VirusTotalHashProviderTest`)
* **Positive Malware Match (`testEicarMaliciousMatch`):** Passed. Standard EICAR test string signature correctly identified as `CONFIRMED_MALICIOUS`.
* **No-Match Safety Invariant (`testNoKnownMatchIsNotSafe`):** Passed. Unknown hashes return `NO_KNOWN_MATCH` with explicit disclosure: *"No known hash match; this is not proof of safety."* The system **never** marks clean lookups as `SAFE`.
* **Outage and Timeout Handling (`testProviderUnavailable`):** Passed. Provider timeout/outage correctly mapped to `UNAVAILABLE` rather than clean.
* **Error Semantics (`testProviderError`):** Passed. Upstream format/server errors correctly mapped to `ERROR`.
* **Privacy Assurance (VirusTotal):** Passed. Provider operates in **hash-only** mode via `GET /api/v3/files/{sha256}`. Raw file bytes are never uploaded. Provider is safely disabled when API key is missing.

### 3.4. SSRF & Per-Hop Redirect Protection (`DownloadCaptureServiceTest` & `UrlSecurityValidatorTest`)
* **Loopback Destination Block (`testSsrfDownloadBlocked`):** Passed. Download requests targeting `127.0.0.1:8080` immediately aborted with `CAPTURE_FAILED` and security policy warning.
* **Cloud Metadata Endpoint Block (`testCloudMetadataBlocked`):** Passed. Requests to AWS/GCP cloud metadata `http://169.254.169.254/latest/user-data` blocked before any connection.
* **Private RFC 1918 Range Blocking:** Passed. Direct or redirected requests to `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` blocked.

### 3.5. Explainable Risk Scoring Engine (`ExplainableRiskEngineTest`)
* **Confirmed Malware Download:** Score calibrated to **100 (HIGH / DANGEROUS)** with critical recommendation warning.
* **Clean Hash Download:** Score elevated to **SUSPICIOUS (MEDIUM)**. Unsolicited file downloads are never declared `SAFE`.
* **Failed Download Capture:** Status calibrated to **UNVERIFIED** to preserve uncertainty when inspection cannot complete.
* **Phishing & Brand Impersonation:** Deceptive login pages mimicking PayPal/Google/Microsoft scored at high risk (>80).
* **Legitimate Websites:** Clean URLs verified with low risk scores (<30, `SAFE`).

---

## 4. Official Maven Test Log Output

```text
[INFO] Scanning for projects...
[INFO] -------------------< com.qrshield:qrshield-backend >--------------------
[INFO] Building qrshield-backend 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] --- resources:3.5.0:resources (default-resources) @ qrshield-backend ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] --- compiler:3.15.0:compile (default-compile) @ qrshield-backend ---
[INFO] Nothing to compile - all classes are up to date.
[INFO] --- resources:3.5.0:testResources (default-testResources) @ qrshield-backend ---
[INFO] --- compiler:3.15.0:testCompile (default-testCompile) @ qrshield-backend ---
[INFO] Nothing to compile - all classes are up to date.
[INFO] --- surefire:3.5.6:test (default-test) @ qrshield-backend ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO] 
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.qrshield.backend.controller.UrlScanControllerTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 15.18 s -- in com.qrshield.backend.controller.UrlScanControllerTest
[INFO] Running com.qrshield.backend.malware.DownloadCaptureServiceTest
19:44:52.904 [main] INFO com.qrshield.backend.malware.QuarantineStorageService -- Successfully quarantined download: opaqueId=artifact-3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456.quarantine, sizeBytes=27, sha256=1ed01ded746d1f50eff84434f48b737f9238e6b683be2738f7ffb326b956743b
19:44:52.970 [main] WARN com.qrshield.backend.security.UrlSecurityValidator -- Blocked SSRF attempt targeting restricted IP 127.0.0.1 for host 127.0.0.1
19:44:52.975 [main] WARN com.qrshield.backend.malware.DownloadCaptureService -- SSRF blocked during download capture for URL http://127.0.0.1:8080/admin/export.exe: Host '127.0.0.1' resolved to restricted address (127.0.0.1). Access is blocked.
19:44:52.998 [main] WARN com.qrshield.backend.malware.DownloadCaptureService -- SSRF blocked during download capture for URL http://169.254.169.254/latest/user-data: Host '169.254.169.254' is an internal, local, or cloud metadata name and is blocked.
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.182 s -- in com.qrshield.backend.malware.DownloadCaptureServiceTest
[INFO] Running com.qrshield.backend.malware.FileHashServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.061 s -- in com.qrshield.backend.malware.FileHashServiceTest
[INFO] Running com.qrshield.backend.malware.FileReputationServiceTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.034 s -- in com.qrshield.backend.malware.FileReputationServiceTest
[INFO] Running com.qrshield.backend.malware.QuarantineStorageServiceTest
19:44:53.140 [main] INFO com.qrshield.backend.malware.QuarantineStorageService -- Successfully quarantined download: opaqueId=artifact-785fa4e1-99bc-4b5a-a46c-db91be8d9858.quarantine, sizeBytes=41, sha256=4b451c4aeed701c0977e47edbc0f25092c1c39c73cdbccdb982fea1ed070fba5
19:44:53.143 [main] INFO com.qrshield.backend.malware.QuarantineStorageService -- Audit: Successfully deleted quarantined artifact: artifact-785fa4e1-99bc-4b5a-a46c-db91be8d9858.quarantine
19:44:53.166 [main] ERROR com.qrshield.backend.malware.QuarantineStorageService -- SECURITY ALERT: Path traversal attempt blocked for filename: ../../../Windows/System32/cmd.exe
19:44:53.168 [main] ERROR com.qrshield.backend.malware.QuarantineStorageService -- SECURITY ALERT: Path traversal attempt blocked for filename: ..\..\secret.txt
19:44:53.192 [main] WARN com.qrshield.backend.malware.QuarantineStorageService -- Quarantine vault capacity reached. Current: 4096 bytes, Max: 4096 bytes
19:44:53.214 [main] WARN com.qrshield.backend.malware.QuarantineStorageService -- Download exceeded size limit of 1024 bytes (read 2048 bytes). Rejecting and purging partial file.
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.138 s -- in com.qrshield.backend.malware.QuarantineStorageServiceTest
[INFO] Running com.qrshield.backend.malware.VirusTotalHashProviderTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.556 s -- in com.qrshield.backend.malware.VirusTotalHashProviderTest
[INFO] Running com.qrshield.backend.QrshieldBackendApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.006 s -- in com.qrshield.backend.QrshieldBackendApplicationTests
[INFO] Running com.qrshield.backend.security.UrlSecurityValidatorTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.031 s -- in com.qrshield.backend.security.UrlSecurityValidatorTest
[INFO] Running com.qrshield.backend.service.ExplainableRiskEngineTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.051 s -- in com.qrshield.backend.service.ExplainableRiskEngineTest
[INFO] Running com.qrshield.backend.service.UrlAnalysisServiceTest
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 7.554 s -- in com.qrshield.backend.service.UrlAnalysisServiceTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 46, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  39.767 s
[INFO] Finished at: 2026-10-23T19:45:01+05:30
[INFO] ------------------------------------------------------------------------
```

---

## 5. Artifact Evidence Model & API Schema Example

When a scan observes or triggers a file download, the response links the parent analysis, redirect chain, quarantined artifact, SHA-256 digest, provider findings, and limitations:

```json
{
  "scanId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
  "initialUrl": "https://example.com/download-portal",
  "finalDestinationUrl": "https://example.com/files/app.bin",
  "domain": "example.com",
  "riskScore": 45,
  "riskCategory": "MEDIUM",
  "status": "SUSPICIOUS",
  "lifecycleStatus": "COMPLETED",
  "downloadDetected": true,
  "downloadArtifacts": [
    {
      "artifactId": "8f3ab184-b049-4180-87a2-1e967d7195c6",
      "analysisId": "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
      "sourceUrl": "https://example.com/files/app.bin",
      "redirectChain": [
        "https://example.com/download-portal",
        "https://example.com/files/app.bin"
      ],
      "finalUrl": "https://example.com/files/app.bin",
      "originalFilename": "app.bin",
      "contentType": "application/octet-stream",
      "sizeBytes": 128450,
      "sha256": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      "quarantineStatus": "QUARANTINED",
      "reputationStatus": "NO_KNOWN_MATCH",
      "findings": [
        {
          "providerName": "MockThreatIntel",
          "status": "NO_KNOWN_MATCH",
          "message": "No known hash match; this is not proof of safety.",
          "checkedAt": "2026-10-23T19:44:53"
        }
      ],
      "limitations": [
        "The file was quarantined and was not executed.",
        "No known hash match does not establish that the file is safe."
      ],
      "createdAt": "2026-10-23T19:44:52"
    }
  ],
  "limitations": [
    "The file was quarantined and was not executed.",
    "No known hash match does not establish that the file is safe."
  ],
  "plainEnglishSummary": "Suspicious activity detected. The website initiated a file download. Although quarantined with no known malware match, unexpected downloads remain a security risk."
}
```

---

## 6. Conclusion

All 46 test cases across the backend, malware quarantine pipeline, streaming cryptographic hashing, threat intelligence providers, SSRF filters, and explainable risk scoring pass with zero failures. The system satisfies all requirements outlined in the Download-to-Hash Malware Detection specification.
