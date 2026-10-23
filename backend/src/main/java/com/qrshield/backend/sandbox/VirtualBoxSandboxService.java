package com.qrshield.backend.sandbox;

import com.qrshield.backend.dto.sandbox.WorkerScanRequest;
import com.qrshield.backend.dto.sandbox.WorkerScanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * Manages the lifecycle of disposable Oracle VirtualBox VMs for URL sandboxing.
 * Controls VM cloning, headless startup, health probing, task submission, and guaranteed cleanup.
 */
@Service
public class VirtualBoxSandboxService {

    private static final Logger log = LoggerFactory.getLogger(VirtualBoxSandboxService.class);
    private static final String VM_NAME_PREFIX = "qrshield-sbx-";

    private final VBoxCli vboxCli;
    private final VirtualBoxProperties properties;
    private final GuestWorkerClient workerClient;
    private final Semaphore concurrencyLimiter;

    public record VmSession(String vmName, String scanId, String host, int port, String authToken) {}

    public VirtualBoxSandboxService(VBoxCli vboxCli, VirtualBoxProperties properties, GuestWorkerClient workerClient) {
        this.vboxCli = vboxCli;
        this.properties = properties;
        this.workerClient = workerClient;
        this.concurrencyLimiter = new Semaphore(properties.getMaxConcurrentVms(), true);
    }

    /**
     * Acquires concurrency slot, provisions a clean disposable VM from base snapshot,
     * boots it headless, and waits until the guest worker becomes healthy.
     */
    public VmSession provisionAndStartVm(String scanId) throws Exception {
        log.info("Requesting VM sandbox slot for scan {}. Available permits: {}", scanId, concurrencyLimiter.availablePermits());

        boolean acquired = concurrencyLimiter.tryAcquire(20, TimeUnit.SECONDS);
        if (!acquired) {
            throw new IllegalStateException("Sandbox capacity reached. Max concurrent VMs (" + properties.getMaxConcurrentVms() + ") are in use.");
        }

        String sanitizedId = scanId.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        if (sanitizedId.length() > 20) {
            sanitizedId = sanitizedId.substring(0, 20);
        }
        String vmName = VM_NAME_PREFIX + sanitizedId;

        try {
            log.info("Cloning disposable VM '{}' from base snapshot '{}/{}'...", vmName, properties.getBaseVmName(), properties.getSnapshotName());
            VBoxCli.ExecutionResult cloneResult = vboxCli.cloneFromSnapshot(
                    properties.getBaseVmName(),
                    properties.getSnapshotName(),
                    vmName,
                    properties.isUseLinkedClones()
            );

            if (!cloneResult.isSuccess()) {
                throw new IllegalStateException("Failed to clone VM '" + vmName + "': " + cloneResult.error());
            }

            log.info("Starting disposable VM '{}' in headless mode...", vmName);
            VBoxCli.ExecutionResult startResult = vboxCli.startHeadless(vmName);
            if (!startResult.isSuccess()) {
                throw new IllegalStateException("Failed to boot VM '" + vmName + "': " + startResult.error());
            }

            // Wait for guest worker to become healthy
            boolean healthy = waitForGuestHealth(properties.getWorkerHost(), properties.getWorkerPort(), properties.getWorkerAuthToken(), properties.getStartupTimeoutSeconds());
            if (!healthy) {
                throw new IllegalStateException("Guest worker failed to reach HEALTHY state within " + properties.getStartupTimeoutSeconds() + " seconds.");
            }

            log.info("Disposable VM '{}' is HEALTHY and ready for analysis.", vmName);
            return new VmSession(vmName, scanId, properties.getWorkerHost(), properties.getWorkerPort(), properties.getWorkerAuthToken());

        } catch (Exception e) {
            log.error("Error during VM provisioning for scan {}: {}", scanId, e.getMessage());
            destroyVm(vmName);
            concurrencyLimiter.release();
            throw e;
        }
    }

    /**
     * Submits scan request to guest worker in the provisioned VM.
     */
    public WorkerScanResponse executeScan(VmSession session, String validatedUrl) {
        WorkerScanRequest request = new WorkerScanRequest(session.scanId(), validatedUrl, properties.getAnalysisTimeoutSeconds());
        return workerClient.submitScan(session.host(), session.port(), session.authToken(), request);
    }

    /**
     * Polls the guest worker health endpoint until healthy or timeout.
     */
    private boolean waitForGuestHealth(String host, int port, String token, int timeoutSeconds) {
        long deadline = System.currentTimeMillis() + (timeoutSeconds * 1000L);
        log.info("Polling guest worker health at {}:{} (timeout: {}s)...", host, port, timeoutSeconds);

        while (System.currentTimeMillis() < deadline) {
            if (workerClient.checkHealth(host, port, token)) {
                return true;
            }
            try {
                Thread.sleep(1500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }

    /**
     * Powers off, unregisters, and deletes the disposable VM, then releases the concurrency permit.
     */
    public void releaseSession(VmSession session) {
        if (session != null && session.vmName() != null) {
            try {
                destroyVm(session.vmName());
            } finally {
                concurrencyLimiter.release();
                log.info("Released sandbox permit for scan {}. Available: {}", session.scanId(), concurrencyLimiter.availablePermits());
            }
        }
    }

    /**
     * Powers off and forcefully deletes the specified VM.
     */
    public String destroyVm(String vmName) {
        if (vmName == null || !vmName.startsWith(VM_NAME_PREFIX)) {
            return "IGNORED_NON_SANDBOX_VM";
        }

        log.info("Destroying disposable VM '{}'...", vmName);
        StringBuilder logSummary = new StringBuilder();

        try {
            if (vboxCli.isVmRunning(vmName)) {
                log.info("Stopping running VM '{}'...", vmName);
                VBoxCli.ExecutionResult powerResult = vboxCli.powerOff(vmName);
                logSummary.append("PowerOff: ").append(powerResult.exitCode()).append("; ");
                Thread.sleep(1000); // Allow VirtualBox state unlock
            }

            log.info("Unregistering and deleting disk for VM '{}'...", vmName);
            VBoxCli.ExecutionResult deleteResult = vboxCli.unregisterAndDelete(vmName);
            logSummary.append("UnregisterDelete: ").append(deleteResult.exitCode());

            if (deleteResult.isSuccess()) {
                log.info("Disposable VM '{}' successfully purged.", vmName);
                return "DELETED";
            } else {
                log.warn("Failed to delete VM '{}': {}", vmName, deleteResult.error());
                return "CLEANUP_FAILED: " + deleteResult.error();
            }

        } catch (Exception e) {
            log.error("Exception while cleaning up VM '{}': {}", vmName, e.getMessage());
            return "CLEANUP_EXCEPTION: " + e.getMessage();
        }
    }

    /**
     * Periodic background recovery job to identify and clean up orphaned disposable VMs
     * left behind by crashes, abrupt restarts, or timeouts.
     */
    @Scheduled(fixedDelay = 300000, initialDelay = 60000) // Runs every 5 minutes
    public void cleanupOrphanedVms() {
        try {
            List<String> vms = vboxCli.listAllVms();
            for (String vmName : vms) {
                if (vmName.startsWith(VM_NAME_PREFIX)) {
                    log.warn("Detected orphaned sandbox VM '{}'. Initiating scheduled cleanup...", vmName);
                    destroyVm(vmName);
                }
            }
        } catch (Exception e) {
            log.error("Error during orphaned VM scheduled scan: {}", e.getMessage());
        }
    }
}
