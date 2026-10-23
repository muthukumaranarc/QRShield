package com.qrshield.worker.service;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.WaitUntilState;
import com.qrshield.worker.dto.SecurityFindingDto;
import com.qrshield.worker.dto.WorkerScanRequest;
import com.qrshield.worker.dto.WorkerScanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Executes passive browser-level inspection using Playwright Java and Chromium.
 * Operates in non-root user context with Chromium sandboxing strictly enabled.
 */
@Service
public class BrowserSandboxService {

    private static final Logger log = LoggerFactory.getLogger(BrowserSandboxService.class);

    @Value("${worker.browser.navigation-timeout-ms:20000}")
    private int navigationTimeoutMs;

    @Value("${worker.browser.user-agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 QRShield-Sandbox/1.0}")
    private String userAgent;

    public WorkerScanResponse inspectUrl(WorkerScanRequest request) {
        long startTime = System.currentTimeMillis();
        String targetUrl = request.getTargetUrl();
        String scanId = request.getScanId();

        WorkerScanResponse response = new WorkerScanResponse();
        response.setScanId(scanId);
        response.setInitialUrl(targetUrl);

        List<String> redirectChain = new ArrayList<>();
        redirectChain.add(targetUrl);
        response.setRedirectChain(redirectChain);

        log.info("Starting Playwright Chromium passive sandbox inspection for: {}", targetUrl);

        // Ensure sandboxing is enabled: do NOT supply --no-sandbox
        BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(List.of(
                        "--disable-gpu",
                        "--disable-dev-shm-usage",
                        "--disable-extensions",
                        "--no-first-run",
                        "--disable-background-networking"
                ));

        try (Playwright playwright = Playwright.create();
             Browser browser = playwright.chromium().launch(launchOptions)) {

            // Ephemeral, isolated browser context with restricted permissions
            Browser.NewContextOptions contextOptions = new Browser.NewContextOptions()
                    .setUserAgent(userAgent)
                    .setViewportSize(1280, 800)
                    .setAcceptDownloads(true) // Enable safe download event observation
                    .setIgnoreHTTPSErrors(false) // Enforce strict TLS validation
                    .setBypassCSP(false) // Respect Content Security Policies
                    .setJavaScriptEnabled(true);

            try (BrowserContext context = browser.newContext(contextOptions);
                 Page page = context.newPage()) {

                // Set strict navigation timeout
                page.setDefaultNavigationTimeout(navigationTimeoutMs);
                page.setDefaultTimeout(navigationTimeoutMs);

                // Listen for download events triggered during page navigation or JavaScript execution
                page.onDownload(download -> {
                    log.warn("Observed browser download event in sandbox: url={}, filename={}", 
                            download.url(), download.suggestedFilename());
                    response.setDownloadDetected(true);
                    response.setDownloadUrl(download.url());
                    response.setDownloadFilename(download.suggestedFilename());
                    // Defensively cancel in guest VM to prevent unauthorized disk execution
                    try {
                        download.cancel();
                    } catch (Exception e) {
                        log.debug("Download cancellation note: {}", e.getMessage());
                    }
                });

                // Listen for redirects and console security warnings
                page.onRequest(req -> {
                    if (req.isNavigationRequest() && !req.url().equals(targetUrl)) {
                        synchronized (redirectChain) {
                            if (!redirectChain.contains(req.url())) {
                                redirectChain.add(req.url());
                            }
                        }
                    }
                });

                page.onConsoleMessage(msg -> {
                    if ("error".equalsIgnoreCase(msg.type())) {
                        response.getConsoleSecurityErrors().add(msg.text());
                    }
                });

                Response mainResponse = null;
                try {
                    // Passive navigation: wait until DOM content loaded or network idle
                    mainResponse = page.navigate(targetUrl, new Page.NavigateOptions()
                            .setWaitUntil(WaitUntilState.DOMCONTENTLOADED)
                            .setTimeout(navigationTimeoutMs));
                } catch (PlaywrightException pe) {
                    log.warn("Navigation warning/failure for {}: {}", targetUrl, pe.getMessage());
                    String msg = pe.getMessage();

                    if (msg.contains("ERR_CERT_") || msg.contains("CERT_COMMON_NAME_INVALID") || msg.contains("CERT_AUTHORITY_INVALID")) {
                        response.setTlsValid(false);
                        response.setTlsErrorDetails(msg);
                    } else if (msg.contains("Timeout") || msg.contains("ERR_CONNECTION_TIMED_OUT")) {
                        response.setStatus("TIMED_OUT");
                        response.setErrorMessage("Destination site timed out after " + (navigationTimeoutMs / 1000) + "s.");
                        response.setExecutionDurationMs(System.currentTimeMillis() - startTime);
                        return response;
                    } else if (msg.contains("ERR_NAME_NOT_RESOLVED") || msg.contains("ERR_CONNECTION_REFUSED")) {
                        response.setStatus("UNREACHABLE");
                        response.setErrorMessage("Host unreachable or refused connection: " + msg);
                        response.setExecutionDurationMs(System.currentTimeMillis() - startTime);
                        return response;
                    }
                }

                // Passive DOM extraction
                String finalUrl = page.url();
                response.setFinalUrl(finalUrl);
                if (!redirectChain.contains(finalUrl)) {
                    redirectChain.add(finalUrl);
                }
                response.setRedirectCount(Math.max(0, redirectChain.size() - 1));
                response.setHasRedirects(response.getRedirectCount() > 0);

                try {
                    response.setPageTitle(page.title());
                } catch (Exception ignored) {
                    response.setPageTitle("Unknown");
                }

                if (mainResponse != null) {
                    response.setHttpStatus(mainResponse.status());
                }

                // Check for password inputs in the DOM
                try {
                    int passwordCount = page.locator("input[type='password']").count();
                    response.setPasswordInputsDetected(passwordCount > 0);
                    if (passwordCount > 0) {
                        response.getFindings().add(new SecurityFindingDto(
                                "AUTH_INPUT_RENDERED",
                                "MEDIUM",
                                "Detected " + passwordCount + " password field(s) rendered in DOM.",
                                "CREDENTIAL_SAFETY"
                        ));
                    }
                } catch (Exception ignored) {}

                // Extract form action destinations
                try {
                    Object evaluated = page.evaluate(
                            "() => Array.from(document.querySelectorAll('form')).map(f => f.action || f.getAttribute('action')).filter(Boolean)"
                    );
                    if (evaluated instanceof List<?> list) {
                        List<String> formActions = list.stream().filter(Objects::nonNull).map(Object::toString).toList();
                        response.setFormActionDestinations(formActions);
                    }
                } catch (Exception ignored) {}

                response.setStatus("SUCCESS");
            }

        } catch (Exception e) {
            log.error("Unhandled Playwright sandbox error for scan {}: {}", scanId, e.getMessage());
            response.setStatus("FAILED");
            response.setErrorMessage("Browser sandbox exception: " + e.getMessage());
        } finally {
            response.setExecutionDurationMs(System.currentTimeMillis() - startTime);
        }

        return response;
    }
}
