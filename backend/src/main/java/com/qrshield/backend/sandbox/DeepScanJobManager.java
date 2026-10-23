package com.qrshield.backend.sandbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qrshield.backend.dto.ScanRequest;
import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.dto.sandbox.DeepScanResponse;
import com.qrshield.backend.dto.sandbox.DeepScanStatusResponse;
import com.qrshield.backend.dto.sandbox.WorkerScanResponse;
import com.qrshield.backend.entity.*;
import com.qrshield.backend.repository.ScanRecordJpaRepository;
import com.qrshield.backend.security.UrlSecurityValidator;
import com.qrshield.backend.service.ExplainableRiskEngine;
import com.qrshield.backend.service.UrlAnalysisService;
import com.qrshield.backend.malware.DownloadArtifact;
import com.qrshield.backend.malware.DownloadCaptureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class DeepScanJobManager {

    private static final Logger log = LoggerFactory.getLogger(DeepScanJobManager.class);

    private final ScanRecordJpaRepository repository;
    private final UrlSecurityValidator securityValidator;
    private final UrlAnalysisService staticAnalysisService;
    private final VirtualBoxSandboxService sandboxService;
    private final ExplainableRiskEngine riskEngine;
    private final DownloadCaptureService downloadCaptureService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;

    public DeepScanJobManager(
            ScanRecordJpaRepository repository,
            UrlSecurityValidator securityValidator,
            UrlAnalysisService staticAnalysisService,
            VirtualBoxSandboxService sandboxService,
            ExplainableRiskEngine riskEngine,
            DownloadCaptureService downloadCaptureService,
            ObjectMapper objectMapper) {
        this.repository = repository;
        this.securityValidator = securityValidator;
        this.staticAnalysisService = staticAnalysisService;
        this.sandboxService = sandboxService;
        this.riskEngine = riskEngine;
        this.downloadCaptureService = downloadCaptureService;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newFixedThreadPool(4);
    }

    /**
     * Initializes and enqueues a new deep sandbox scan job.
     */
    public ScanRecord submitJob(String rawUrl, String originalDecodedContent, ScanSource source, String notes) {
        ScanRecord record = new ScanRecord();
        record.setOriginalUrl(rawUrl);
        record.setOriginalDecodedContent(originalDecodedContent != null ? originalDecodedContent : rawUrl);
        record.setScanSource(source);
        record.setNotes(notes);
        record.setLifecycleStatus(ScanLifecycleStatus.QUEUED);
        record.setVmLifecycleStatus(VmLifecycleStatus.NOT_STARTED);

        ScanRecord saved = repository.save(record);
        log.info("Enqueued deep scan job with ID: {}", saved.getId());

        executorService.submit(() -> executeJob(saved.getId(), rawUrl));
        return saved;
    }

    private void executeJob(String scanId, String rawUrl) {
        long startTime = System.currentTimeMillis();
        log.info("Starting execution of deep scan job: {}", scanId);

        Optional<ScanRecord> opt = repository.findById(scanId);
        if (opt.isEmpty()) {
            log.error("Scan record {} not found in database.", scanId);
            return;
        }

        ScanRecord record = opt.get();
        VirtualBoxSandboxService.VmSession session = null;

        try {
            // Step 1: Pre-flight SSRF and Destination IP Validation
            UrlSecurityValidator.ValidationResult validation = securityValidator.validateUrl(rawUrl);
            if (!validation.valid()) {
                log.warn("URL security validation failed for scan {}: {}", scanId, validation.failureReason());
                record.setLifecycleStatus(ScanLifecycleStatus.FAILED);
                record.setStatus(ScanStatus.DANGEROUS);
                record.setRiskScore(100);
                record.setRiskCategory(RiskCategory.HIGH);
                record.setErrorMessage("Security Policy Block: " + validation.failureReason());
                record.setWarningSigns("SSRF/Private Network Protection Triggered: " + validation.failureReason());
                record.setRecommendations("Do not open this URL. It targets restricted internal networks, loopback, or cloud metadata endpoints.");
                record.setExecutionDurationMs(System.currentTimeMillis() - startTime);
                record.setCompletedAt(LocalDateTime.now());
                repository.save(record);
                return;
            }

            String validatedUrl = validation.sanitizedUrl();

            // Step 2: Run static heuristic analysis
            ScanRequest staticReq = new ScanRequest(validatedUrl, record.getScanSource());
            ScanResponse staticRes = staticAnalysisService.analyze(staticReq);
            record.setDomain(staticRes.getDomain());
            record.setProviderName(staticRes.getProviderName());
            record.setProtocol(staticRes.getProtocol());
            record.setHttps(staticRes.isHttps());
            record.setIpAddress(validation.resolvedAddress().getHostAddress());

            // Step 3: Spin up isolated disposable VM
            record.setLifecycleStatus(ScanLifecycleStatus.STARTING_VM);
            record.setVmLifecycleStatus(VmLifecycleStatus.CLONING);
            repository.save(record);

            session = sandboxService.provisionAndStartVm(scanId);
            record.setVmName(session.vmName());
            record.setVmLifecycleStatus(VmLifecycleStatus.HEALTHY);

            // Step 4: Perform dynamic Playwright inspection in Guest VM
            record.setLifecycleStatus(ScanLifecycleStatus.ANALYZING);
            repository.save(record);

            WorkerScanResponse sandboxResult = sandboxService.executeScan(session, validatedUrl);

            // Step 4.5: Check for downloads from sandbox observations or direct file downloads
            List<DownloadArtifact> downloadArtifacts = new ArrayList<>();
            boolean downloadDetected = false;

            if (sandboxResult != null && sandboxResult.isDownloadDetected() && sandboxResult.getDownloadUrl() != null) {
                downloadDetected = true;
                log.info("Sandbox observed download event: capturing and quarantining from {}", sandboxResult.getDownloadUrl());
                DownloadArtifact artifact = downloadCaptureService.captureDownloadFromUrl(
                        scanId, sandboxResult.getDownloadUrl(), sandboxResult.getRedirectChain());
                downloadArtifacts.add(artifact);
            } else if (isDownloadableUrl(validatedUrl)) {
                downloadDetected = true;
                log.info("Target URL appears to be a direct file download: capturing and quarantining {}", validatedUrl);
                DownloadArtifact artifact = downloadCaptureService.captureDownloadFromUrl(
                        scanId, validatedUrl, sandboxResult != null ? sandboxResult.getRedirectChain() : List.of(validatedUrl));
                downloadArtifacts.add(artifact);
            }

            // Step 5: Synthesize findings and calculate final risk
            record.setLifecycleStatus(ScanLifecycleStatus.FINALIZING);
            repository.save(record);

            ExplainableRiskEngine.AssessmentResult assessment = riskEngine.evaluate(staticRes, sandboxResult, downloadArtifacts);

            record.setFinalDestinationUrl(sandboxResult.getFinalUrl() != null ? sandboxResult.getFinalUrl() : validatedUrl);
            record.setPageTitle(sandboxResult.getPageTitle());
            record.setHttpStatus(sandboxResult.getHttpStatus());
            record.setHasRedirects(sandboxResult.isHasRedirects());
            record.setRedirectCount(sandboxResult.getRedirectCount());
            record.setRiskScore(assessment.riskScore());
            record.setRiskCategory(assessment.riskCategory());
            record.setStatus(assessment.status());
            record.setWarningSigns(String.join("\n", assessment.warningSigns()));
            record.setRecommendations(String.join("\n", assessment.recommendations()));
            record.setSecurityFindingsJson(objectMapper.writeValueAsString(assessment.findings()));
            record.setRedirectSummaryJson(objectMapper.writeValueAsString(sandboxResult.getRedirectChain()));
            record.setDownloadDetected(downloadDetected);

            if (!downloadArtifacts.isEmpty()) {
                record.setDownloadArtifactsJson(objectMapper.writeValueAsString(downloadArtifacts));
                List<String> combinedLimitations = downloadArtifacts.stream()
                        .flatMap(a -> a.getLimitations().stream())
                        .distinct()
                        .toList();
                record.setLimitationsJson(objectMapper.writeValueAsString(combinedLimitations));
            }

            record.setLifecycleStatus(assessment.status() == ScanStatus.UNVERIFIED ? ScanLifecycleStatus.UNVERIFIED : ScanLifecycleStatus.COMPLETED);

        } catch (Exception e) {
            log.error("Fatal error during sandbox execution for scan {}: {}", scanId, e.getMessage(), e);
            record.setLifecycleStatus(ScanLifecycleStatus.FAILED);
            record.setStatus(ScanStatus.UNVERIFIED);
            record.setErrorMessage("Sandbox execution error: " + e.getMessage());
            record.setWarningSigns("Deep dynamic inspection failed: " + e.getMessage());
            record.setRecommendations("Could not verify page safety in VM sandbox. Do not open link without verification.");
        } finally {
            // Guaranteed Cleanup
            if (session != null) {
                record.setVmLifecycleStatus(VmLifecycleStatus.STOPPING);
                repository.save(record);

                sandboxService.releaseSession(session);
                record.setVmLifecycleStatus(VmLifecycleStatus.DELETED);
                record.setCleanupStatus("PURGED_AND_UNREGISTERED");
            } else {
                record.setCleanupStatus("NO_VM_PROVISIONED");
            }

            record.setExecutionDurationMs(System.currentTimeMillis() - startTime);
            record.setCompletedAt(LocalDateTime.now());
            repository.save(record);
            log.info("Deep scan job {} finished with status {} in {}ms", scanId, record.getLifecycleStatus(), record.getExecutionDurationMs());
        }
    }

    public Optional<DeepScanResponse> getScanResult(String scanId) {
        return repository.findById(scanId).map(this::toResponseDto);
    }

    public Optional<DeepScanStatusResponse> getScanStatus(String scanId) {
        return repository.findById(scanId).map(record -> {
            int progress = switch (record.getLifecycleStatus()) {
                case QUEUED -> 10;
                case STARTING_VM -> 30;
                case ANALYZING -> 60;
                case FINALIZING -> 85;
                case COMPLETED, UNVERIFIED -> 100;
                case FAILED -> 100;
            };
            DeepScanStatusResponse resp = new DeepScanStatusResponse(
                    record.getId(),
                    record.getLifecycleStatus(),
                    record.getVmLifecycleStatus(),
                    progress,
                    record.getErrorMessage() != null ? record.getErrorMessage() : "Processing: " + record.getLifecycleStatus()
            );
            resp.setScannedAt(record.getScannedAt());
            resp.setExecutionDurationMs(record.getExecutionDurationMs());
            return resp;
        });
    }

    public List<DeepScanResponse> getAllScans() {
        return repository.findAllByOrderByScannedAtDesc().stream()
                .map(this::toResponseDto)
                .toList();
    }

    @SuppressWarnings("unchecked")
    private DeepScanResponse toResponseDto(ScanRecord record) {
        DeepScanResponse resp = new DeepScanResponse();
        resp.setScanId(record.getId());
        resp.setOriginalDecodedContent(record.getOriginalDecodedContent());
        resp.setInitialUrl(record.getOriginalUrl());
        resp.setFinalDestinationUrl(record.getFinalDestinationUrl());
        resp.setDomain(record.getDomain());
        resp.setProviderName(record.getProviderName());
        resp.setIpAddress(record.getIpAddress());
        resp.setPageTitle(record.getPageTitle());
        resp.setHttpStatus(record.getHttpStatus());
        resp.setHttps(record.isHttps());
        resp.setHasRedirects(record.isHasRedirects());
        resp.setRedirectCount(record.getRedirectCount());
        resp.setRiskScore(record.getRiskScore());
        resp.setRiskCategory(record.getRiskCategory());
        resp.setStatus(record.getStatus());
        resp.setLifecycleStatus(record.getLifecycleStatus());
        resp.setVmLifecycleStatus(record.getVmLifecycleStatus());
        resp.setVmName(record.getVmName());
        resp.setCleanupStatus(record.getCleanupStatus());
        resp.setExecutionDurationMs(record.getExecutionDurationMs());
        resp.setErrorMessage(record.getErrorMessage());
        resp.setScannedAt(record.getScannedAt());
        resp.setCompletedAt(record.getCompletedAt());

        if (record.getWarningSigns() != null && !record.getWarningSigns().isEmpty()) {
            resp.setWarningSigns(List.of(record.getWarningSigns().split("\n")));
        }
        if (record.getRecommendations() != null && !record.getRecommendations().isEmpty()) {
            resp.setRecommendations(List.of(record.getRecommendations().split("\n")));
        }

        resp.setDownloadDetected(record.isDownloadDetected());

        try {
            if (record.getRedirectSummaryJson() != null) {
                resp.setRedirectChain(objectMapper.readValue(record.getRedirectSummaryJson(), List.class));
            }
            if (record.getDownloadArtifactsJson() != null) {
                List<DownloadArtifact> artifacts = objectMapper.readValue(
                        record.getDownloadArtifactsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, DownloadArtifact.class)
                );
                resp.setDownloadArtifacts(artifacts);
            }
            if (record.getLimitationsJson() != null) {
                resp.setLimitations(objectMapper.readValue(record.getLimitationsJson(), List.class));
            }
        } catch (Exception e) {
            log.warn("Error deserializing scan details for {}: {}", record.getId(), e.getMessage());
        }

        return resp;
    }

    private boolean isDownloadableUrl(String url) {
        if (url == null) {
            return false;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        return lower.endsWith(".exe") || lower.endsWith(".bin") || lower.endsWith(".msi") ||
               lower.endsWith(".apk") || lower.endsWith(".dmg") || lower.endsWith(".zip") ||
               lower.endsWith(".iso") || lower.endsWith(".sh") || lower.endsWith(".bat") ||
               lower.endsWith(".cmd") || lower.endsWith(".ps1") || lower.endsWith(".scr") ||
               lower.endsWith(".dll") || lower.endsWith(".vbs") || lower.endsWith(".jar");
    }
}
