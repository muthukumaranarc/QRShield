package com.qrshield.backend.service;

import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.dto.sandbox.WorkerScanResponse;
import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ExplainableRiskEngineTest {

    private ExplainableRiskEngine engine;

    @BeforeEach
    void setUp() {
        engine = new ExplainableRiskEngine();
    }

    @Test
    @DisplayName("Evaluate legitimate site with clean sandbox findings")
    void testCleanWebsite() {
        ScanResponse staticRes = new ScanResponse();
        staticRes.setDomain("www.google.com");
        staticRes.setRiskScore(0);
        staticRes.setRiskCategory(RiskCategory.LOW);

        WorkerScanResponse sandboxRes = new WorkerScanResponse();
        sandboxRes.setStatus("SUCCESS");
        sandboxRes.setPageTitle("Google");
        sandboxRes.setTlsValid(true);
        sandboxRes.setHttpStatus(200);
        sandboxRes.setHasRedirects(false);
        sandboxRes.setPasswordInputsDetected(false);

        ExplainableRiskEngine.AssessmentResult result = engine.evaluate(staticRes, sandboxRes);

        assertEquals(RiskCategory.LOW, result.riskCategory());
        assertEquals(ScanStatus.SAFE, result.status());
        assertTrue(result.riskScore() <= 30);
        assertNotNull(result.recommendedAction());
    }

    @Test
    @DisplayName("Evaluate phishing credential harvester mimicking PayPal")
    void testPhishingCredentialHarvester() {
        ScanResponse staticRes = new ScanResponse();
        staticRes.setDomain("paypa1-security-check.xyz");
        staticRes.setRiskScore(80);
        staticRes.setRiskCategory(RiskCategory.HIGH);

        WorkerScanResponse sandboxRes = new WorkerScanResponse();
        sandboxRes.setStatus("SUCCESS");
        sandboxRes.setPageTitle("PayPal Login - Security Verification");
        sandboxRes.setTlsValid(false);
        sandboxRes.setTlsErrorDetails("Self-signed SSL Certificate");
        sandboxRes.setHttpStatus(200);
        sandboxRes.setPasswordInputsDetected(true);
        sandboxRes.setFormActionDestinations(List.of("http://evil-collector.top/steal.php"));
        sandboxRes.setHasRedirects(true);
        sandboxRes.setRedirectCount(3);

        ExplainableRiskEngine.AssessmentResult result = engine.evaluate(staticRes, sandboxRes);

        assertEquals(RiskCategory.HIGH, result.riskCategory());
        assertEquals(ScanStatus.DANGEROUS, result.status());
        assertTrue(result.riskScore() >= 80);
        assertFalse(result.findings().isEmpty());
        assertTrue(result.warningSigns().stream().anyMatch(w -> w.contains("password") || w.contains("certificate") || w.contains("Deceptive")));
    }

    @Test
    @DisplayName("Evaluate failed/unreachable sandbox output as UNVERIFIED without false sense of safety")
    void testUnverifiedWhenSandboxFails() {
        ScanResponse staticRes = new ScanResponse();
        staticRes.setDomain("mystery-domain-123.com");
        staticRes.setRiskScore(20);

        WorkerScanResponse sandboxRes = new WorkerScanResponse();
        sandboxRes.setStatus("TIMED_OUT");
        sandboxRes.setErrorMessage("Destination site timed out after 20s.");

        ExplainableRiskEngine.AssessmentResult result = engine.evaluate(staticRes, sandboxRes);

        assertEquals(ScanStatus.UNVERIFIED, result.status());
        assertTrue(result.warningSigns().stream().anyMatch(w -> w.contains("could not be completed")));
        assertFalse(result.plainEnglishSummary().toLowerCase().contains("is safe"));
        assertTrue(result.plainEnglishSummary().contains("cannot be verified"));
    }

    @Test
    @DisplayName("Evaluate confirmed malware download hash: overrides score to 100 DANGEROUS")
    void testConfirmedMalwareDownload() {
        ScanResponse staticRes = new ScanResponse();
        staticRes.setDomain("innocent-looking-site.com");
        staticRes.setRiskScore(10);

        WorkerScanResponse sandboxRes = new WorkerScanResponse();
        sandboxRes.setStatus("SUCCESS");
        sandboxRes.setPageTitle("Home");
        sandboxRes.setTlsValid(true);
        sandboxRes.setHttpStatus(200);

        com.qrshield.backend.malware.DownloadArtifact artifact = new com.qrshield.backend.malware.DownloadArtifact("scan-1", "https://innocent.com/trojan.exe");
        artifact.setQuarantineStatus(com.qrshield.backend.malware.QuarantineStatus.QUARANTINED);
        artifact.setSha256("275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f");
        artifact.setReputationStatus(com.qrshield.backend.malware.ReputationStatus.CONFIRMED_MALICIOUS);

        ExplainableRiskEngine.AssessmentResult result = engine.evaluate(staticRes, sandboxRes, List.of(artifact));

        assertEquals(100, result.riskScore());
        assertEquals(RiskCategory.HIGH, result.riskCategory());
        assertEquals(ScanStatus.DANGEROUS, result.status());
        assertTrue(result.warningSigns().stream().anyMatch(w -> w.contains("Confirmed malware download detected")));
        assertTrue(result.plainEnglishSummary().contains("Malware threat detected"));
    }

    @Test
    @DisplayName("Evaluate clean hash download: NO_KNOWN_MATCH is never mapped to SAFE")
    void testNoKnownMatchDownloadNeverSafe() {
        ScanResponse staticRes = new ScanResponse();
        staticRes.setDomain("download-portal.org");
        staticRes.setRiskScore(0);

        WorkerScanResponse sandboxRes = new WorkerScanResponse();
        sandboxRes.setStatus("SUCCESS");
        sandboxRes.setPageTitle("Download Page");
        sandboxRes.setTlsValid(true);
        sandboxRes.setHttpStatus(200);

        com.qrshield.backend.malware.DownloadArtifact artifact = new com.qrshield.backend.malware.DownloadArtifact("scan-2", "https://download-portal.org/app.zip");
        artifact.setQuarantineStatus(com.qrshield.backend.malware.QuarantineStatus.QUARANTINED);
        artifact.setSha256("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
        artifact.setReputationStatus(com.qrshield.backend.malware.ReputationStatus.NO_KNOWN_MATCH);

        ExplainableRiskEngine.AssessmentResult result = engine.evaluate(staticRes, sandboxRes, List.of(artifact));

        assertNotEquals(ScanStatus.SAFE, result.status(), "Unsolicited download with clean hash must NEVER be declared SAFE");
        assertEquals(ScanStatus.SUSPICIOUS, result.status());
        assertEquals(RiskCategory.MEDIUM, result.riskCategory());
        assertTrue(result.warningSigns().stream().anyMatch(w -> w.contains("File download initiated")));
    }

    @Test
    @DisplayName("Evaluate capture failed download: preserves uncertainty as UNVERIFIED")
    void testCaptureFailedPreservesUncertainty() {
        ScanResponse staticRes = new ScanResponse();
        staticRes.setDomain("flaky-download.net");
        staticRes.setRiskScore(10);

        WorkerScanResponse sandboxRes = new WorkerScanResponse();
        sandboxRes.setStatus("SUCCESS");
        sandboxRes.setPageTitle("File Drop");
        sandboxRes.setTlsValid(true);
        sandboxRes.setHttpStatus(200);

        com.qrshield.backend.malware.DownloadArtifact artifact = new com.qrshield.backend.malware.DownloadArtifact("scan-3", "https://flaky.net/drop");
        artifact.setQuarantineStatus(com.qrshield.backend.malware.QuarantineStatus.CAPTURE_FAILED);
        artifact.setReputationStatus(com.qrshield.backend.malware.ReputationStatus.NOT_CHECKED);

        ExplainableRiskEngine.AssessmentResult result = engine.evaluate(staticRes, sandboxRes, List.of(artifact));

        assertEquals(ScanStatus.UNVERIFIED, result.status());
        assertTrue(result.warningSigns().stream().anyMatch(w -> w.contains("could not be safely captured")));
    }
}
