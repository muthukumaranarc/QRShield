package com.qrshield.backend.sandbox;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "qrshield.sandbox.virtualbox")
public class VirtualBoxProperties {

    /**
     * Path to the VBoxManage executable on Windows or Linux.
     * Defaults to standard Oracle VirtualBox location on Windows.
     */
    private String executablePath = "C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe";

    /**
     * Name of the clean, pre-configured Ubuntu base template VM.
     */
    private String baseVmName = "qrshield-ubuntu-base";

    /**
     * Name of the snapshot taken when the guest worker is ready and installed.
     */
    private String snapshotName = "clean-worker-ready";

    /**
     * Whether to use fast linked clones (--options link). If false or unsupported, performs full clone.
     */
    private boolean useLinkedClones = true;

    /**
     * Host-only network interface name on VirtualBox host (e.g. "VirtualBox Host-Only Ethernet Adapter").
     */
    private String hostOnlyInterface = "VirtualBox Host-Only Ethernet Adapter";

    /**
     * Static or DHCP IP assigned to the guest worker on the host-only network.
     */
    private String workerHost = "192.168.56.101";

    /**
     * Port on which the Guest Worker Spring Boot application listens inside the guest VM.
     */
    private int workerPort = 8085;

    /**
     * Shared secret or per-job authentication token sent in header X-Worker-Auth-Token.
     */
    private String workerAuthToken = "qrshield-sandbox-secure-token-2026";

    /**
     * Maximum time in seconds to wait for the VM to start and the guest worker health check to pass.
     */
    private int startupTimeoutSeconds = 45;

    /**
     * Maximum time in seconds to wait for Playwright browser inspection inside the guest.
     */
    private int analysisTimeoutSeconds = 30;

    /**
     * Maximum number of disposable VMs that can run concurrently.
     */
    private int maxConcurrentVms = 2;

    /**
     * Timeout for command execution (VBoxManage commands) in seconds.
     */
    private int commandTimeoutSeconds = 30;

    public String getExecutablePath() {
        return executablePath;
    }

    public void setExecutablePath(String executablePath) {
        this.executablePath = executablePath;
    }

    public String getBaseVmName() {
        return baseVmName;
    }

    public void setBaseVmName(String baseVmName) {
        this.baseVmName = baseVmName;
    }

    public String getSnapshotName() {
        return snapshotName;
    }

    public void setSnapshotName(String snapshotName) {
        this.snapshotName = snapshotName;
    }

    public boolean isUseLinkedClones() {
        return useLinkedClones;
    }

    public void setUseLinkedClones(boolean useLinkedClones) {
        this.useLinkedClones = useLinkedClones;
    }

    public String getHostOnlyInterface() {
        return hostOnlyInterface;
    }

    public void setHostOnlyInterface(String hostOnlyInterface) {
        this.hostOnlyInterface = hostOnlyInterface;
    }

    public String getWorkerHost() {
        return workerHost;
    }

    public void setWorkerHost(String workerHost) {
        this.workerHost = workerHost;
    }

    public int getWorkerPort() {
        return workerPort;
    }

    public void setWorkerPort(int workerPort) {
        this.workerPort = workerPort;
    }

    public String getWorkerAuthToken() {
        return workerAuthToken;
    }

    public void setWorkerAuthToken(String workerAuthToken) {
        this.workerAuthToken = workerAuthToken;
    }

    public int getStartupTimeoutSeconds() {
        return startupTimeoutSeconds;
    }

    public void setStartupTimeoutSeconds(int startupTimeoutSeconds) {
        this.startupTimeoutSeconds = startupTimeoutSeconds;
    }

    public int getAnalysisTimeoutSeconds() {
        return analysisTimeoutSeconds;
    }

    public void setAnalysisTimeoutSeconds(int analysisTimeoutSeconds) {
        this.analysisTimeoutSeconds = analysisTimeoutSeconds;
    }

    public int getMaxConcurrentVms() {
        return maxConcurrentVms;
    }

    public void setMaxConcurrentVms(int maxConcurrentVms) {
        this.maxConcurrentVms = maxConcurrentVms;
    }

    public int getCommandTimeoutSeconds() {
        return commandTimeoutSeconds;
    }

    public void setCommandTimeoutSeconds(int commandTimeoutSeconds) {
        this.commandTimeoutSeconds = commandTimeoutSeconds;
    }
}
