package com.qrshield.backend.sandbox;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * Low-level, safe wrapper for Oracle VirtualBox command line (VBoxManage).
 * Strictly avoids shell invocation (cmd.exe / bash) and prevents argument injection.
 */
@Component
public class VBoxCli {

    private static final Logger log = LoggerFactory.getLogger(VBoxCli.class);
    private static final Pattern SAFE_VM_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_.-]{3,64}$");

    private final VirtualBoxProperties properties;

    public record ExecutionResult(int exitCode, String output, String error) {
        public boolean isSuccess() {
            return exitCode == 0;
        }
    }

    public VBoxCli(VirtualBoxProperties properties) {
        this.properties = properties;
    }

    /**
     * Executes VBoxManage with safe argument array.
     */
    public ExecutionResult execute(List<String> commandArgs) {
        String executablePath = resolveExecutable();
        List<String> fullCommand = new ArrayList<>();
        fullCommand.add(executablePath);
        fullCommand.addAll(commandArgs);

        log.debug("Executing VBoxManage command: {}", commandArgs);

        ProcessBuilder processBuilder = new ProcessBuilder(fullCommand);
        processBuilder.redirectErrorStream(false);

        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();

        try {
            Process process = processBuilder.start();

            // Asynchronously read stdout and stderr
            Thread outReader = new Thread(() -> readStream(process.getInputStream(), stdout));
            Thread errReader = new Thread(() -> readStream(process.getErrorStream(), stderr));
            outReader.start();
            errReader.start();

            boolean finished = process.waitFor(properties.getCommandTimeoutSeconds(), TimeUnit.SECONDS);

            if (!finished) {
                log.warn("VBoxManage command timed out after {}s: {}", properties.getCommandTimeoutSeconds(), commandArgs);
                process.destroyForcibly();
                return new ExecutionResult(-1, stdout.toString(), "Process timed out after " + properties.getCommandTimeoutSeconds() + " seconds");
            }

            outReader.join(2000);
            errReader.join(2000);

            int exitCode = process.exitValue();
            return new ExecutionResult(exitCode, stdout.toString().trim(), stderr.toString().trim());

        } catch (Exception e) {
            log.error("Failed to execute VBoxManage: {}", e.getMessage());
            return new ExecutionResult(-1, stdout.toString(), "Execution failed: " + e.getMessage());
        }
    }

    private void readStream(java.io.InputStream stream, StringBuilder target) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                target.append(line).append(System.lineSeparator());
            }
        } catch (Exception ignored) {}
    }

    private String resolveExecutable() {
        String configuredPath = properties.getExecutablePath();
        if (configuredPath != null && new File(configuredPath).canExecute()) {
            return configuredPath;
        }
        // Fallback to VBoxManage from system PATH
        return "VBoxManage";
    }

    public void validateVmName(String vmName) {
        if (vmName == null || !SAFE_VM_NAME_PATTERN.matcher(vmName).matches()) {
            throw new IllegalArgumentException("Invalid VM name. Name must match pattern ^[a-zA-Z0-9_.-]{3,64}$: " + vmName);
        }
    }

    /**
     * Clones a VM from a base VM snapshot.
     */
    public ExecutionResult cloneFromSnapshot(String baseVmName, String snapshotName, String newVmName, boolean linkedClone) {
        validateVmName(baseVmName);
        validateVmName(newVmName);

        List<String> args = new ArrayList<>(List.of(
                "clonevm", baseVmName,
                "--snapshot", snapshotName,
                "--name", newVmName,
                "--register"
        ));

        if (linkedClone) {
            args.add("--options");
            args.add("link");
        }

        ExecutionResult result = execute(args);
        // If linked clone fails due to VirtualBox version/format limitation, fallback to full clone
        if (!result.isSuccess() && linkedClone) {
            log.warn("Linked clone failed with output [{}]. Retrying with standard full clone...", result.error());
            List<String> fullCloneArgs = List.of(
                    "clonevm", baseVmName,
                    "--snapshot", snapshotName,
                    "--name", newVmName,
                    "--register",
                    "--mode", "machine"
            );
            return execute(fullCloneArgs);
        }
        return result;
    }

    /**
     * Starts VM in headless mode without UI desktop.
     */
    public ExecutionResult startHeadless(String vmName) {
        validateVmName(vmName);
        return execute(List.of("startvm", vmName, "--type", "headless"));
    }

    /**
     * Powers off a running VM immediately.
     */
    public ExecutionResult powerOff(String vmName) {
        validateVmName(vmName);
        return execute(List.of("controlvm", vmName, "poweroff"));
    }

    /**
     * Unregisters VM and deletes associated disk images from storage.
     */
    public ExecutionResult unregisterAndDelete(String vmName) {
        validateVmName(vmName);
        return execute(List.of("unregistervm", vmName, "--delete"));
    }

    /**
     * Checks if a specific VM is currently running.
     */
    public boolean isVmRunning(String vmName) {
        validateVmName(vmName);
        ExecutionResult result = execute(List.of("list", "runningvms"));
        if (!result.isSuccess()) {
            return false;
        }
        return result.output().contains("\"" + vmName + "\"");
    }

    /**
     * Lists all registered VM names.
     */
    public List<String> listAllVms() {
        ExecutionResult result = execute(List.of("list", "vms"));
        List<String> vms = new ArrayList<>();
        if (result.isSuccess() && !result.output().isEmpty()) {
            String[] lines = result.output().split(System.lineSeparator());
            for (String line : lines) {
                int firstQuote = line.indexOf('"');
                int secondQuote = line.indexOf('"', firstQuote + 1);
                if (firstQuote != -1 && secondQuote != -1) {
                    vms.add(line.substring(firstQuote + 1, secondQuote));
                }
            }
        }
        return vms;
    }

    /**
     * Retrieves guest property (such as assigned IP address via guest additions).
     */
    public Optional<String> getGuestProperty(String vmName, String propertyKey) {
        validateVmName(vmName);
        ExecutionResult result = execute(List.of("guestproperty", "get", vmName, propertyKey));
        if (result.isSuccess() && result.output().startsWith("Value: ")) {
            return Optional.of(result.output().substring("Value: ".length()).trim());
        }
        return Optional.empty();
    }
}
