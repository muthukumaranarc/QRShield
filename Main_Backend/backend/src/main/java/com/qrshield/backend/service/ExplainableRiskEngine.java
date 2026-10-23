package com.qrshield.backend.service;

import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.dto.sandbox.SecurityFindingDto;
import com.qrshield.backend.dto.sandbox.WorkerScanResponse;
import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanStatus;
import com.qrshield.backend.malware.DownloadArtifact;
import com.qrshield.backend.malware.QuarantineStatus;
import com.qrshield.backend.malware.ReputationStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Explainable Cybersecurity Risk Engine.
 * Synthesizes static pre-click indicators, deep browser sandbox observations, and quarantined
 * file download reputation findings into a calibrated, explainable security score with plain-English rationales.
 */
@Service
public class ExplainableRiskEngine {

    public record AssessmentResult(
            int riskScore,
            RiskCategory riskCategory,
            ScanStatus status,
            List<SecurityFindingDto> findings,
            List<String> warningSigns,
            List<String> recommendations,
            String plainEnglishSummary,
            String recommendedAction
    ) {}

    /**
     * Backward-compatible evaluation without download artifacts.
     */
    public AssessmentResult evaluate(ScanResponse staticAnalysis, WorkerScanResponse sandboxResult) {
        return evaluate(staticAnalysis, sandboxResult, List.of());
    }

    /**
     * Comprehensive evaluation incorporating static heuristics, browser sandbox signals, and download artifacts.
     */
    public AssessmentResult evaluate(ScanResponse staticAnalysis, WorkerScanResponse sandboxResult, List<DownloadArtifact> downloadArtifacts) {
        int score = 0;
        List<SecurityFindingDto> findings = new ArrayList<>();
        List<String> warningSigns = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // If sandbox failed or target was unreachable, handle UNVERIFIED status explicitly
        if (sandboxResult == null || "FAILED".equals(sandboxResult.getStatus()) || "TIMED_OUT".equals(sandboxResult.getStatus()) || "UNREACHABLE".equals(sandboxResult.getStatus())) {
            int fallbackScore = Math.max(50, staticAnalysis != null ? staticAnalysis.getRiskScore() : 50);
            warningSigns.add("Sandbox inspection could not be completed (" + (sandboxResult != null ? sandboxResult.getErrorMessage() : "Worker unreachable") + ").");
            recommendations.add("Treat this destination with extreme caution. Do not input credentials or authorize payments.");

            return new AssessmentResult(
                    fallbackScore,
                    RiskCategory.MEDIUM,
                    ScanStatus.UNVERIFIED,
                    findings,
                    warningSigns,
                    recommendations,
                    "The destination website could not be dynamically inspected inside the isolated browser sandbox. Preliminary static indicators were evaluated, but full safety cannot be verified.",
                    "Exercise caution. Do not enter credentials or download files from an unverified destination."
            );
        }

        // --- 1. Static Indicators Integration ---
        if (staticAnalysis != null) {
            score = Math.max(score, staticAnalysis.getRiskScore() / 2); // Base weight from static heuristics
            if (staticAnalysis.getWarningSigns() != null) {
                warningSigns.addAll(staticAnalysis.getWarningSigns());
            }
            if (staticAnalysis.getSecurityRecommendations() != null) {
                recommendations.addAll(staticAnalysis.getSecurityRecommendations());
            }
        }

        // --- 2. Dynamic Browser Sandbox Findings ---

        // Check TLS Validity
        if (!sandboxResult.isTlsValid()) {
            score += 35;
            findings.add(new SecurityFindingDto("TLS_INVALID", "HIGH", "Browser encountered invalid or untrusted TLS certificate: " + sandboxResult.getTlsErrorDetails(), "ENCRYPTION"));
            warningSigns.add("The website presents an invalid or self-signed TLS/SSL certificate.");
        }

        // Check for Password Fields on Insecure / Suspicious Pages
        if (sandboxResult.isPasswordInputsDetected()) {
            score += 25;
            findings.add(new SecurityFindingDto("PASSWORD_FIELD_DETECTED", "MEDIUM", "Password input elements were rendered on the destination webpage.", "CREDENTIAL_SAFETY"));
            warningSigns.add("Webpage contains password authentication fields. Verify domain identity before entering credentials.");
        }

        // Deceptive / Phishing Page Title Inspection
        String pageTitle = sandboxResult.getPageTitle() != null ? sandboxResult.getPageTitle().toLowerCase(Locale.ROOT) : "";
        String domain = staticAnalysis != null && staticAnalysis.getDomain() != null ? staticAnalysis.getDomain().toLowerCase(Locale.ROOT) : "";

        if (pageTitle.contains("login") || pageTitle.contains("sign in") || pageTitle.contains("verify") || pageTitle.contains("banking") || pageTitle.contains("paypal") || pageTitle.contains("microsoft") || pageTitle.contains("google")) {
            if (!domain.contains("google.com") && !domain.contains("microsoft.com") && !domain.contains("paypal.com") && !domain.contains("apple.com")) {
                score += 40;
                findings.add(new SecurityFindingDto("DECEPTIVE_BRAND_TITLE", "HIGH", "Page title claims brand identity ('" + sandboxResult.getPageTitle() + "') but host domain ('" + domain + "') does not match legitimate organization.", "BRAND_IMPERSONATION"));
                warningSigns.add("Deceptive login interface: Page title mimics a major service on an unrelated domain.");
            }
        }

        // Redirect Anomalies
        if (sandboxResult.getRedirectCount() > 2) {
            score += 20;
            findings.add(new SecurityFindingDto("EXCESSIVE_REDIRECTS", "MEDIUM", "URL underwent " + sandboxResult.getRedirectCount() + " redirect hops across different endpoints.", "OBFUSCATION"));
            warningSigns.add("Multi-hop redirect chain detected. Attackers frequently use multiple redirects to evade pre-click scanners.");
        }

        // Foreign Form Actions
        if (sandboxResult.getFormActionDestinations() != null) {
            for (String action : sandboxResult.getFormActionDestinations()) {
                if (action != null && (action.startsWith("http://") || (action.startsWith("https://") && !action.contains(domain)))) {
                    score += 25;
                    findings.add(new SecurityFindingDto("FOREIGN_FORM_SUBMISSION", "HIGH", "Webpage submits user-entered form data to external destination: " + action, "DATA_EXFILTRATION"));
                    warningSigns.add("Form inputs on this page are configured to submit data to an external third-party domain.");
                    break;
                }
            }
        }

        // HTTP Error status
        if (sandboxResult.getHttpStatus() != null && sandboxResult.getHttpStatus() >= 400) {
            warningSigns.add("Destination server responded with HTTP status " + sandboxResult.getHttpStatus() + ".");
        }

        // --- 3. Download Artifact & File Malware Evidence Integration ---
        boolean hasConfirmedMalware = false;
        boolean hasDownloadAttempt = false;
        boolean hasCaptureFailure = false;

        if (downloadArtifacts != null && !downloadArtifacts.isEmpty()) {
            hasDownloadAttempt = true;
            for (DownloadArtifact artifact : downloadArtifacts) {
                if (artifact.getReputationStatus() == ReputationStatus.CONFIRMED_MALICIOUS) {
                    hasConfirmedMalware = true;
                    score = 100;
                    findings.add(new SecurityFindingDto("MALICIOUS_DOWNLOAD_CONFIRMED", "CRITICAL", 
                            "Downloaded file matched confirmed malware signature (SHA-256: " + artifact.getSha256() + ")", "MALWARE"));
                    warningSigns.add("Confirmed malware download detected: File hash identified as malicious by threat intelligence.");
                    recommendations.add("CRITICAL: Do not open or run any files from this site. The destination dropped confirmed malware.");
                } else if (artifact.getReputationStatus() == ReputationStatus.NO_KNOWN_MATCH) {
                    score += 25;
                    findings.add(new SecurityFindingDto("UNVERIFIED_DOWNLOAD_CAPTURED", "MEDIUM", 
                            "File was downloaded and quarantined (SHA-256: " + artifact.getSha256() + "). No known hash match in threat databases; this is not proof of safety.", "FILE_SAFETY"));
                    warningSigns.add("File download initiated by target site. No known hash match exists, but uncataloged or newly crafted files may still be harmful.");
                    recommendations.add("Never open unexpected downloads. A clean hash lookup does not verify that a file is safe.");
                } else if (artifact.getQuarantineStatus() == QuarantineStatus.REJECTED_OVERSIZED) {
                    score += 20;
                    findings.add(new SecurityFindingDto("OVERSIZED_DOWNLOAD_ATTEMPT", "MEDIUM", 
                            "Download exceeded maximum allowable size limit and was aborted.", "FILE_SAFETY"));
                    warningSigns.add("Destination initiated an oversized file download.");
                } else if (artifact.getQuarantineStatus() == QuarantineStatus.REJECTED_CAPACITY) {
                    warningSigns.add("Quarantine storage vault capacity limit reached; file download rejected.");
                } else if (artifact.getQuarantineStatus() == QuarantineStatus.CAPTURE_FAILED) {
                    hasCaptureFailure = true;
                    score += 15;
                    warningSigns.add("A file download was initiated but could not be safely captured/quarantined.");
                }
            }
        }

        // Cap score between 0 and 100
        int finalScore = Math.min(100, Math.max(0, score));

        // Determine Category and Status
        RiskCategory category;
        ScanStatus status;
        String recommendedAction;
        String plainSummary;

        if (hasConfirmedMalware || finalScore >= 70) {
            category = RiskCategory.HIGH;
            status = ScanStatus.DANGEROUS;
            recommendedAction = "DO NOT OPEN THIS LINK. Block and report to your cybersecurity team immediately.";
            plainSummary = hasConfirmedMalware 
                    ? "Malware threat detected! The site initiates an automatic download of a file confirmed as malicious by threat intelligence."
                    : "High-risk threat indicators detected. The link presents characteristics of credential phishing, deceptive brand impersonation, or obfuscated malicious redirects.";
        } else if (hasCaptureFailure && finalScore < 50) {
            category = RiskCategory.MEDIUM;
            status = ScanStatus.UNVERIFIED;
            recommendedAction = "PROCEED WITH EXTREME CAUTION. Automatic download could not be verified.";
            plainSummary = "A file download event was detected during sandbox inspection, but the download capture could not be completed. Safety cannot be verified.";
        } else if (finalScore >= 35 || hasDownloadAttempt) {
            category = RiskCategory.MEDIUM;
            status = ScanStatus.SUSPICIOUS;
            recommendedAction = "PROCEED WITH CAUTION. Do not enter confidential credentials or authorize financial transactions.";
            plainSummary = hasDownloadAttempt
                    ? "Suspicious activity detected. The website initiated a file download. Although quarantined with no known malware match, unexpected downloads remain a security risk."
                    : "Suspicious indicators detected. The destination contains anomalous redirect chains, unusual domain structures, or unverified hosting providers.";
        } else {
            category = RiskCategory.LOW;
            status = ScanStatus.SAFE;
            recommendedAction = "Destination verified with low risk indicators. Follow standard organizational security practices.";
            plainSummary = "No active deceptive elements, malicious scripts, or anomalous redirects were observed during sandbox inspection.";
        }

        return new AssessmentResult(
                finalScore,
                category,
                status,
                findings,
                warningSigns,
                recommendations,
                plainSummary,
                recommendedAction
        );
    }
}
