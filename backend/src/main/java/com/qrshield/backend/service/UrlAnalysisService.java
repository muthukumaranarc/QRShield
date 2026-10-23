package com.qrshield.backend.service;

import com.qrshield.backend.dto.ScanRequest;
import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanRecord;
import com.qrshield.backend.entity.ScanSource;
import com.qrshield.backend.entity.ScanStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class UrlAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(UrlAnalysisService.class);

    @Value("${qrshield.analysis.timeout-ms:4000}")
    private int timeoutMs;

    @Value("${qrshield.analysis.max-redirects:5}")
    private int maxRedirects;

    @Value("${qrshield.analysis.user-agent:QRShield-CyberSecurity-Bot/1.0}")
    private String userAgent;

    // Known URL shorteners
    private static final Set<String> KNOWN_SHORTENERS = Set.of(
            "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "rebrandly.com",
            "cutt.ly", "shorturl.at", "tiny.cc", "goo.gl", "qr.ae", "rb.gy", "bl.ink",
            "v.gd", "tny.im", "s.id", "soo.gd", "clicky.me"
    );

    // Highly abused Top-Level Domains (frequent in phishing & malware campaigns)
    private static final Set<String> SUSPICIOUS_TLDS = Set.of(
            "tk", "ml", "ga", "cf", "gq", "top", "click", "buzz", "fit", "rest", "surf",
            "monster", "quest", "cam", "work", "stream", "party", "gdn", "date", "racing",
            "review", "country", "kim", "science", "download", "accountant", "faith", "loan",
            "xyz", "link", "live", "vip", "icu", "club", "online"
    );

    // High-profile target brands frequently impersonated in phishing
    private static final List<String> TARGET_BRANDS = List.of(
            "google", "paypal", "microsoft", "apple", "amazon", "netflix", "facebook",
            "instagram", "whatsapp", "twitter", "chase", "wellsfargo", "bankofamerica",
            "sbi", "hdfc", "icici", "binance", "coinbase", "dropbox", "github", "linkedin",
            "steam", "spotify", "adobe", "telegram", "discord", "paytm", "phonepe"
    );

    // Sensitive keywords often found in phishing URLs
    private static final List<String> SUSPICIOUS_KEYWORDS = List.of(
            "login", "signin", "verify", "verification", "account-update", "account-suspended",
            "update-billing", "credential", "banking", "secure-auth", "password", "security-check",
            "confirm-identity", "wallet-recovery", "airdrop", "free-gift", "claim-reward",
            "crypto-bonus", "otp", "2fa", "unlock-account", "urgent-notice", "gift-card",
            "unauthorized-activity", "re-activate", "security-update"
    );

    // Risky executable extensions
    private static final Set<String> DANGEROUS_EXTENSIONS = Set.of(
            ".exe", ".apk", ".vbs", ".bat", ".cmd", ".ps1", ".scr", ".jar", ".iso", ".msi", ".dll"
    );

    // IPv4 pattern
    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$"
    );

    /**
     * Core method to analyze any URL, evaluate security indicators, and produce a complete assessment.
     */
    public ScanResponse analyze(ScanRequest request) {
        String rawUrl = request.getUrl() != null ? request.getUrl().trim() : "";
        ScanSource source = request.getSource() != null ? request.getSource() : ScanSource.QR_CODE;

        ScanResponse response = new ScanResponse();
        response.setOriginalUrl(rawUrl);
        response.setScanSource(source);
        response.setNotes(request.getNotes());
        response.setScannedAt(LocalDateTime.now());

        if (rawUrl.isEmpty()) {
            response.setRiskScore(100);
            response.setRiskCategory(RiskCategory.HIGH);
            response.setStatus(ScanStatus.DANGEROUS);
            response.getWarningSigns().add("Empty or null URL supplied for analysis");
            response.getSecurityRecommendations().add("Provide a valid URL or QR code content to inspect.");
            return response;
        }

        // 1. Check for non-HTTP schemes (UPI, phone, mailto, dangerous javascript/data)
        if (checkSpecialSchemes(rawUrl, response)) {
            return response;
        }

        // 2. Normalize URL (prepend https if missing)
        String normalizedUrl = normalizeUrl(rawUrl);
        response.setFinalDestinationUrl(normalizedUrl);

        URI uri;
        try {
            uri = URI.create(normalizedUrl);
        } catch (Exception e) {
            response.setRiskScore(90);
            response.setRiskCategory(RiskCategory.HIGH);
            response.setStatus(ScanStatus.DANGEROUS);
            response.getWarningSigns().add("Malformed or unparseable URL syntax: " + e.getMessage());
            response.getSecurityRecommendations().add("Do not open this link as it may be crafted to bypass security filters.");
            return response;
        }

        String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
        String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
        int port = uri.getPort();
        String path = uri.getPath() != null ? uri.getPath().toLowerCase() : "";
        String query = uri.getQuery() != null ? uri.getQuery().toLowerCase() : "";

        response.setDomain(host);
        response.setProtocol(scheme.toUpperCase());
        response.setHttps("https".equalsIgnoreCase(scheme));

        // 3. Provider detection & DNS Resolution
        resolveProviderAndNetwork(host, response);

        // 4. Trace redirects safely
        traceRedirects(normalizedUrl, response);

        // 5. Cybersecurity Heuristic Risk Assessment
        evaluateSecurityRisks(host, scheme, port, path, query, response);

        // 6. Build tailored security recommendations
        buildRecommendations(response);

        return response;
    }

    /**
     * Inspect non-web schemes like upi://, tel:, mailto:, javascript:, data:
     */
    private boolean checkSpecialSchemes(String url, ScanResponse response) {
        String lower = url.toLowerCase();
        if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("file:")) {
            response.setRiskScore(95);
            response.setRiskCategory(RiskCategory.HIGH);
            response.setStatus(ScanStatus.DANGEROUS);
            response.setProtocol(lower.substring(0, lower.indexOf(':')).toUpperCase());
            response.setDomain("Local Script / Payload");
            response.setProviderName("Direct Script Injection");
            response.getWarningSigns().add("High-risk execution scheme detected (" + response.getProtocol() + "). Common vector for Cross-Site Scripting (XSS) and remote exploit execution.");
            response.getSecurityRecommendations().add("DO NOT open or run this QR code payload. It contains executable script instructions.");
            return true;
        }

        if (lower.startsWith("upi://") || lower.startsWith("gpay://") || lower.startsWith("phonepe://") || lower.startsWith("paytmmp://")) {
            response.setRiskScore(25);
            response.setRiskCategory(RiskCategory.LOW);
            response.setStatus(ScanStatus.SAFE);
            response.setProtocol("UPI / Payment Scheme");
            response.setDomain("UPI Payment Network");
            response.setProviderName("NPCI / Unified Payments Interface");
            response.getDetails().put("isPaymentLink", true);

            // Extract receiver and amount if present
            Map<String, String> upiParams = parseQueryParameters(url);
            String payeeName = upiParams.getOrDefault("pn", "Unknown Merchant");
            String payeeVpa = upiParams.getOrDefault("pa", "Not specified");
            String amount = upiParams.getOrDefault("am", "Flexible amount");

            response.getDetails().put("payeeName", payeeName);
            response.getDetails().put("payeeVpa", payeeVpa);
            response.getDetails().put("amount", amount);

            response.getWarningSigns().add("This is an instant financial transaction link (UPI payment request).");
            response.getSecurityRecommendations().add("Verify payee VPA (" + payeeVpa + ") and merchant name (" + payeeName + ") before authorizing payment on your mobile UPI app.");
            return true;
        }

        if (lower.startsWith("tel:") || lower.startsWith("mailto:") || lower.startsWith("sms:")) {
            response.setRiskScore(15);
            response.setRiskCategory(RiskCategory.LOW);
            response.setStatus(ScanStatus.SAFE);
            response.setProtocol(lower.substring(0, lower.indexOf(':')).toUpperCase());
            response.setDomain("Direct Communication Scheme");
            response.setProviderName("Mobile Native Handler");
            response.getWarningSigns().add("This is a direct contact link (Phone/SMS/Email).");
            response.getSecurityRecommendations().add("Verify the phone number or email address before initiating communication.");
            return true;
        }

        return false;
    }

    /**
     * Normalize URL with protocol if absent
     */
    private String normalizeUrl(String url) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return "https://" + url;
        }
        return url;
    }

    /**
     * Resolve IP address, hosting provider, and infrastructure
     */
    private void resolveProviderAndNetwork(String host, ScanResponse response) {
        if (host == null || host.isEmpty()) {
            response.setProviderName("Unknown / Invalid Host");
            return;
        }

        // Match Known Platforms & Infrastructure Providers first
        String detectedProvider = identifyProviderByHost(host);

        try {
            InetAddress address = InetAddress.getByName(host);
            String ip = address.getHostAddress();
            response.setIpAddress(ip);

            if (detectedProvider == null || detectedProvider.equals("Independent / Generic Host")) {
                detectedProvider = identifyProviderByIpOrReverseDns(address, ip);
            }
            response.setProviderName(detectedProvider);
            response.getDetails().put("resolvedIp", ip);
            response.getDetails().put("canonicalHost", address.getCanonicalHostName());
            response.getDetails().put("dnsResolved", true);

        } catch (UnknownHostException e) {
            log.warn("DNS resolution failed for host: {}", host);
            response.setIpAddress("Unresolved");
            response.setProviderName(detectedProvider != null ? detectedProvider : "Unresolved Domain / Offline");
            response.getDetails().put("dnsResolved", false);
            response.getWarningSigns().add("DNS lookup failed: Domain does not exist or DNS records have been revoked/expired. Server is unreachable.");
        }
    }

    /**
     * Provider identification by hostname signatures
     */
    private String identifyProviderByHost(String host) {
        String lower = host.toLowerCase();

        if (KNOWN_SHORTENERS.contains(lower)) {
            return "URL Shortener Service (" + lower + ")";
        }

        if (lower.endsWith("google.com") || lower.endsWith("google.co.in") || lower.endsWith("youtube.com") || lower.endsWith("gstatic.com") || lower.endsWith("appspot.com")) {
            return "Google LLC / Alphabet Inc.";
        }
        if (lower.endsWith("microsoft.com") || lower.endsWith("azure.com") || lower.endsWith("live.com") || lower.endsWith("office.com") || lower.endsWith("windows.net")) {
            return "Microsoft Corporation / Azure Cloud";
        }
        if (lower.endsWith("aws.amazon.com") || lower.endsWith("amazonaws.com") || lower.endsWith("cloudfront.net")) {
            return "Amazon Web Services (AWS)";
        }
        if (lower.endsWith("apple.com") || lower.endsWith("icloud.com")) {
            return "Apple Inc.";
        }
        if (lower.endsWith("facebook.com") || lower.endsWith("instagram.com") || lower.endsWith("whatsapp.com") || lower.endsWith("meta.com")) {
            return "Meta Platforms, Inc.";
        }
        if (lower.endsWith("cloudflare.com") || lower.endsWith("cloudflarestream.com") || lower.endsWith("pages.dev") || lower.endsWith("workers.dev")) {
            return "Cloudflare CDN / Edge Network";
        }
        if (lower.endsWith("github.com") || lower.endsWith("github.io")) {
            return "GitHub / Microsoft";
        }
        if (lower.endsWith("vercel.app") || lower.endsWith("vercel.com")) {
            return "Vercel Cloud Platform";
        }
        if (lower.endsWith("netlify.app") || lower.endsWith("netlify.com")) {
            return "Netlify Hosting";
        }
        if (lower.endsWith("render.com") || lower.endsWith("onrender.com")) {
            return "Render Cloud";
        }
        if (lower.endsWith("paypal.com") || lower.endsWith("paypal.me")) {
            return "PayPal Holdings, Inc.";
        }
        if (lower.endsWith("razorpay.com")) {
            return "Razorpay Payments";
        }
        if (lower.endsWith("stripe.com")) {
            return "Stripe Inc.";
        }
        if (lower.endsWith("hostinger.com") || lower.endsWith("hostinger.in")) {
            return "Hostinger International";
        }
        if (lower.endsWith("godaddy.com")) {
            return "GoDaddy Operating Company";
        }
        if (lower.endsWith("namecheap.com")) {
            return "Namecheap Registrar";
        }

        return "Independent / Generic Host";
    }

    /**
     * Identify provider by reverse DNS or IP ranges
     */
    private String identifyProviderByIpOrReverseDns(InetAddress address, String ip) {
        String canonical = address.getCanonicalHostName().toLowerCase();

        if (canonical.contains("google") || canonical.contains("1e100.net")) return "Google Infrastructure / 1e100.net";
        if (canonical.contains("cloudflare")) return "Cloudflare Anycast Network";
        if (canonical.contains("amazon") || canonical.contains("aws") || canonical.contains("compute.internal")) return "Amazon Web Services (AWS)";
        if (canonical.contains("azure") || canonical.contains("microsoft")) return "Microsoft Azure Cloud";
        if (canonical.contains("akamai")) return "Akamai Technologies Edge";
        if (canonical.contains("fastly")) return "Fastly Edge Cloud";
        if (canonical.contains("digitalocean")) return "DigitalOcean, LLC";
        if (canonical.contains("linode")) return "Akamai / Linode";
        if (canonical.contains("oracle")) return "Oracle Cloud Infrastructure (OCI)";

        // IP range hints
        if (ip.startsWith("104.") || ip.startsWith("172.67.") || ip.startsWith("188.114.")) return "Cloudflare Protected";
        if (ip.startsWith("34.") || ip.startsWith("35.") || ip.startsWith("142.250.")) return "Google Cloud Platform";
        if (ip.startsWith("52.") || ip.startsWith("54.") || ip.startsWith("18.") || ip.startsWith("3.")) return "Amazon AWS Cloud";

        return "Hosting Provider (" + canonical + ")";
    }

    /**
     * Safely trace redirects without downloading heavy/malicious payloads
     */
    private void traceRedirects(String initialUrl, ScanResponse response) {
        List<String> chain = new ArrayList<>();
        chain.add(initialUrl);

        try {
            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.NEVER)
                    .connectTimeout(Duration.ofMillis(timeoutMs))
                    .build();

            String currentUrl = initialUrl;
            int count = 0;

            while (count < maxRedirects) {
                HttpRequest headRequest = HttpRequest.newBuilder()
                        .uri(URI.create(currentUrl))
                        .method("HEAD", HttpRequest.BodyPublishers.noBody())
                        .header("User-Agent", userAgent)
                        .timeout(Duration.ofMillis(timeoutMs))
                        .build();

                HttpResponse<Void> httpResponse = client.send(headRequest, HttpResponse.BodyHandlers.discarding());
                int statusCode = httpResponse.statusCode();

                if (statusCode >= 300 && statusCode < 400) {
                    Optional<String> locationHeader = httpResponse.headers().firstValue("Location");
                    if (locationHeader.isPresent()) {
                        String nextUrl = locationHeader.get();
                        // Resolve relative redirect
                        if (!nextUrl.startsWith("http://") && !nextUrl.startsWith("https://")) {
                            URI base = URI.create(currentUrl);
                            nextUrl = base.resolve(nextUrl).toString();
                        }
                        chain.add(nextUrl);
                        currentUrl = nextUrl;
                        count++;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            response.setRedirectCount(count);
            response.setHasRedirects(count > 0);
            response.setRedirectChain(chain);
            response.setFinalDestinationUrl(currentUrl);

            if (count > 0) {
                response.getDetails().put("finalDestinationUrl", currentUrl);
                // Also update destination domain
                try {
                    URI finalUri = URI.create(currentUrl);
                    if (finalUri.getHost() != null) {
                        response.getDetails().put("finalDestinationDomain", finalUri.getHost());
                    }
                } catch (Exception ignored) {}
            }

        } catch (Exception e) {
            log.debug("Redirect probe completed with message: {}", e.getMessage());
            // Safe fallback if connection times out or fails
            response.setRedirectCount(chain.size() - 1);
            response.setHasRedirects(chain.size() > 1);
            response.setRedirectChain(chain);
            response.setFinalDestinationUrl(chain.get(chain.size() - 1));
        }
    }

    /**
     * Comprehensive cybersecurity heuristic rules
     */
    private void evaluateSecurityRisks(String host, String scheme, int port, String path, String query, ScanResponse response) {
        int score = 0;
        List<String> warnings = response.getWarningSigns();
        Map<String, Object> details = response.getDetails();

        boolean dnsFailed = Boolean.FALSE.equals(details.get("dnsResolved"));

        // 1. SSL/TLS Encryption check
        if (!"https".equalsIgnoreCase(scheme)) {
            score += 15;
            warnings.add("Unencrypted HTTP Protocol: Link does not use HTTPS encryption. Traffic can be eavesdropped, altered, or intercepted via Man-in-the-Middle (MitM) attacks.");
            details.put("usesHttps", false);
        } else {
            details.put("usesHttps", true);
        }

        // 2. IP Address host check (phishing & C2 servers frequently use raw IP addresses)
        if (IPV4_PATTERN.matcher(host).matches() || host.startsWith("[") && host.endsWith("]")) {
            score += 45;
            warnings.add("Raw IP Address Hostname: URL directly targets an IP address (" + host + ") instead of a verified registered domain. Legitimate services virtually never use raw IP URLs.");
            details.put("isIpHost", true);
        } else {
            details.put("isIpHost", false);
        }

        // 3. Known URL Shortener detection
        if (KNOWN_SHORTENERS.contains(host)) {
            score += 25;
            warnings.add("URL Shortener Detected (" + host + "): Obfuscates the final web destination, preventing users from seeing where the link really leads before clicking.");
            details.put("isUrlShortener", true);
            if (response.isHasRedirects()) {
                warnings.add("Shortened link expands to: " + response.getFinalDestinationUrl());
            }
        } else {
            details.put("isUrlShortener", false);
        }

        // 4. Suspicious Top-Level Domain (TLD)
        String tld = extractTld(host);
        details.put("tld", tld);
        if (SUSPICIOUS_TLDS.contains(tld)) {
            score += 30;
            warnings.add("High-Risk TLD (." + tld + "): This domain extension has an abnormally high statistical correlation with malicious spam, credential harvesting, and scam campaigns.");
            details.put("isSuspiciousTld", true);
        } else {
            details.put("isSuspiciousTld", false);
        }

        // 5. Excessive Subdomain Depth (e.g. login.secure.verify.paypal.com.scam.net)
        int subdomainCount = countSubdomains(host);
        details.put("subdomainCount", subdomainCount);
        if (subdomainCount >= 3) {
            score += 20;
            warnings.add("Excessive Subdomain Stacking (" + subdomainCount + " levels): Phishers frequently stack multiple subdomains to mimic legitimate brand URLs on mobile displays.");
            details.put("excessiveSubdomains", true);
        }

        // 6. Punycode / IDN Homograph attack check (e.g. xn--gogle-qqa.com)
        if (host.startsWith("xn--") || host.contains(".xn--")) {
            score += 40;
            warnings.add("Punycode / Homograph Attack Vector (starts with 'xn--'): Internationalized Domain Name that uses lookalike characters from other alphabets (Cyrillic, Greek) to visually imitate trusted brand domains.");
            details.put("isPunycode", true);
        }

        // 7. Typosquatting / Brand Spoofing Check
        String spoofedBrand = detectBrandSpoofing(host);
        if (spoofedBrand != null) {
            score += 45;
            warnings.add("Suspected Brand Impersonation / Typosquatting: Domain appears to counterfeit popular brand '" + spoofedBrand.toUpperCase() + "' using character replacement, spelling variations, or brand injection.");
            details.put("spoofedBrand", spoofedBrand);
            details.put("isBrandSpoofing", true);
        }

        // 8. Shannon Entropy Calculation (randomized DGA domains or phishing tokens)
        double entropy = calculateShannonEntropy(host);
        details.put("domainEntropy", Math.round(entropy * 100.0) / 100.0);
        if (entropy > 3.8 && host.length() > 10) {
            score += 20;
            warnings.add("High Character Entropy (" + String.format("%.2f", entropy) + "): Domain name appears to be randomly or algorithmically generated (frequently used in malware command & control or disposable phishing links).");
            details.put("highEntropy", true);
        }

        // 9. Sensitive Phishing Keywords in URL Path & Query
        List<String> detectedKeywords = findSuspiciousKeywords(path + " " + query);
        if (!detectedKeywords.isEmpty()) {
            int keywordPenalty = Math.min(detectedKeywords.size() * 12, 35);
            score += keywordPenalty;
            warnings.add("Suspicious Security & Credential Keywords Found: [" + String.join(", ", detectedKeywords) + "]. Typical of fake login portals and phishing landing pages.");
            details.put("detectedKeywords", detectedKeywords);
        }

        // 10. Dangerous Executable or Script File Download
        for (String ext : DANGEROUS_EXTENSIONS) {
            if (path.endsWith(ext) || query.contains(ext)) {
                score += 50;
                warnings.add("Direct Executable / Malware Payload Download Detected (" + ext + "): Link immediately attempts to download or execute binary code on the client machine.");
                details.put("dangerousFileDownload", ext);
                break;
            }
        }

        // 11. Unusual Network Port
        if (port != -1 && port != 80 && port != 443 && port != 8080) {
            score += 15;
            warnings.add("Non-Standard Web Port (:" + port + "): Most safe web services run on port 80 or 443. Unusual ports often indicate rogue servers or tunneling.");
            details.put("unusualPort", port);
        }

        // 12. Multiple / High Redirect Hops
        if (response.getRedirectCount() >= 3) {
            score += 20;
            warnings.add("Suspicious Redirect Chain (" + response.getRedirectCount() + " hops): Multiple forwarding hops detected, often used to bypass email/SMS scanners.");
            details.put("excessiveRedirects", true);
        }

        // 13. Trust credits for verified top-tier legitimate domains with clean paths
        if (isReputableDomain(host) && detectedKeywords.isEmpty() && !details.containsKey("isBrandSpoofing") && "https".equalsIgnoreCase(scheme)) {
            score = Math.min(score, 10);
            details.put("reputableDomain", true);
        }

        // 14. Unverified status handling
        if (dnsFailed) {
            // DNS failed - cannot verify URL
            score = Math.max(score, 45);
            warnings.add("LIMITATION NOTICE: QRShield cannot reach or verify this domain. Host could not be resolved or server is offline. This link cannot be certified as safe.");
        }

        // Clamp score between 0 and 100
        int finalScore = Math.max(0, Math.min(100, score));
        response.setRiskScore(finalScore);

        // Assign Risk Category & Status
        if (finalScore >= 70) {
            response.setRiskCategory(RiskCategory.HIGH);
            response.setStatus(ScanStatus.DANGEROUS);
        } else if (finalScore >= 30) {
            response.setRiskCategory(RiskCategory.MEDIUM);
            if (dnsFailed) {
                response.setStatus(ScanStatus.UNVERIFIED);
            } else {
                response.setStatus(ScanStatus.SUSPICIOUS);
            }
        } else {
            response.setRiskCategory(RiskCategory.LOW);
            if (dnsFailed) {
                response.setStatus(ScanStatus.UNVERIFIED);
            } else {
                response.setStatus(ScanStatus.SAFE);
            }
        }

        // If safe and no warnings
        if (warnings.isEmpty()) {
            warnings.add("No significant cybersecurity threats or deceptive patterns detected.");
        }
    }

    /**
     * Build actionable security recommendations based on analysis
     */
    private void buildRecommendations(ScanResponse response) {
        List<String> recs = response.getSecurityRecommendations();
        RiskCategory category = response.getRiskCategory();
        ScanStatus status = response.getStatus();
        Map<String, Object> details = response.getDetails();

        if (status == ScanStatus.UNVERIFIED) {
            recs.add("The target domain could not be resolved or reached. Exercise caution and do not attempt to bypass browser security errors.");
            recs.add("Check whether the URL has a typo or was generated by an unverified source.");
            return;
        }

        if (category == RiskCategory.HIGH) {
            recs.add("DO NOT OPEN THIS LINK. It poses a high cybersecurity threat.");
            recs.add("DO NOT input any credentials, passwords, credit card numbers, or OTP codes.");
            recs.add("If you received this QR code in a public place or unsolicited message, report it to cybersecurity administrators or the relevant platform.");
            if (Boolean.TRUE.equals(details.get("isBrandSpoofing"))) {
                recs.add("Navigate to the legitimate service by manually typing the official website address in your browser instead of clicking this link.");
            }
            if (details.containsKey("dangerousFileDownload")) {
                recs.add("Do not accept or run any file downloads prompted by this link.");
            }
        } else if (category == RiskCategory.MEDIUM) {
            recs.add("Proceed with caution. Several suspicious markers or obscured destinations were identified.");
            if (Boolean.TRUE.equals(details.get("isUrlShortener"))) {
                recs.add("Confirm the sender's identity and verify the destination URL before interacting with the page.");
            }
            if (Boolean.FALSE.equals(details.get("usesHttps"))) {
                recs.add("Avoid entering sensitive or personal information as the connection is unencrypted.");
            }
            recs.add("Inspect the browser address bar carefully to ensure the destination domain is authentic.");
        } else {
            recs.add("URL appears safe based on domain reputation and heuristic indicators.");
            recs.add("Always maintain standard vigilance and verify the SSL padlock icon in your browser.");
        }
    }

    /**
     * Detect Brand Spoofing / Typosquatting (e.g. paypa1, micros0ft, goog1e, g00gle, netfl1x)
     */
    private String detectBrandSpoofing(String host) {
        String cleaned = host.toLowerCase().replaceAll("[^a-z0-9]", "");

        for (String brand : TARGET_BRANDS) {
            // If the domain is actually the genuine brand domain, skip
            if (isGenuineBrandDomain(host, brand)) {
                continue;
            }

            // Check if domain contains brand name embedded within suspicious context
            // e.g. paypal-security-update.com or secure-google-login.net
            if (host.contains(brand)) {
                return brand;
            }

            // Check character replacements (0 for o, 1 for l/i, vv for w)
            String normalizedDomain = host
                    .replace('0', 'o')
                    .replace('1', 'l')
                    .replace("vv", "w")
                    .replace('5', 's')
                    .replace('3', 'e');

            if (normalizedDomain.contains(brand)) {
                return brand;
            }

            // Levenshtein distance on domain labels
            String[] labels = host.split("\\.");
            for (String label : labels) {
                if (label.length() >= 4 && Math.abs(label.length() - brand.length()) <= 1) {
                    int dist = computeLevenshteinDistance(label, brand);
                    if (dist == 1) {
                        return brand;
                    }
                }
            }
        }
        return null;
    }

    private boolean isGenuineBrandDomain(String host, String brand) {
        return host.equals(brand + ".com") || host.endsWith("." + brand + ".com") ||
               host.equals(brand + ".co.in") || host.endsWith("." + brand + ".co.in") ||
               host.equals(brand + ".org") || host.endsWith("." + brand + ".org");
    }

    private boolean isReputableDomain(String host) {
        return host.endsWith("google.com") || host.endsWith("microsoft.com") ||
               host.endsWith("apple.com") || host.endsWith("github.com") ||
               host.endsWith("wikipedia.org") || host.endsWith("gov.in") ||
               host.endsWith(".gov") || host.endsWith(".edu");
    }

    private String extractTld(String host) {
        int lastDot = host.lastIndexOf('.');
        if (lastDot != -1 && lastDot < host.length() - 1) {
            return host.substring(lastDot + 1).toLowerCase();
        }
        return "";
    }

    private int countSubdomains(String host) {
        String[] parts = host.split("\\.");
        return Math.max(0, parts.length - 2);
    }

    private List<String> findSuspiciousKeywords(String text) {
        List<String> found = new ArrayList<>();
        String lower = text.toLowerCase();
        for (String kw : SUSPICIOUS_KEYWORDS) {
            if (lower.contains(kw)) {
                found.add(kw);
            }
        }
        return found;
    }

    private double calculateShannonEntropy(String text) {
        if (text == null || text.isEmpty()) return 0.0;
        Map<Character, Integer> freqMap = new HashMap<>();
        for (char c : text.toCharArray()) {
            freqMap.put(c, freqMap.getOrDefault(c, 0) + 1);
        }
        double entropy = 0.0;
        int len = text.length();
        for (int count : freqMap.values()) {
            double p = (double) count / len;
            entropy -= p * (Math.log(p) / Math.log(2));
        }
        return entropy;
    }

    private int computeLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[s1.length()][s2.length()];
    }

    private Map<String, String> parseQueryParameters(String uriStr) {
        Map<String, String> map = new HashMap<>();
        int qIdx = uriStr.indexOf('?');
        if (qIdx != -1 && qIdx < uriStr.length() - 1) {
            String queryPart = uriStr.substring(qIdx + 1);
            String[] pairs = queryPart.split("&");
            for (String pair : pairs) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2) {
                    try {
                        map.put(URLDecoder.decode(kv[0], "UTF-8"), URLDecoder.decode(kv[1], "UTF-8"));
                    } catch (Exception e) {
                        map.put(kv[0], kv[1]);
                    }
                }
            }
        }
        return map;
    }

    /**
     * Convert ScanResponse to MongoDB document for persistence
     */
    public ScanRecord toEntity(ScanResponse response) {
        ScanRecord record = new ScanRecord();
        if (response.getId() != null) {
            record.setId(response.getId());
        }
        record.setOriginalUrl(response.getOriginalUrl());
        record.setFinalDestinationUrl(response.getFinalDestinationUrl());
        record.setDomain(response.getDomain());
        record.setProviderName(response.getProviderName());
        record.setIpAddress(response.getIpAddress());
        record.setProtocol(response.getProtocol());
        record.setHttps(response.isHttps());
        record.setHasRedirects(response.isHasRedirects());
        record.setRedirectCount(response.getRedirectCount());
        record.setRiskScore(response.getRiskScore());
        record.setRiskCategory(response.getRiskCategory());
        record.setStatus(response.getStatus());
        record.setWarningSigns(String.join("||", response.getWarningSigns()));
        record.setRecommendations(String.join("||", response.getSecurityRecommendations()));
        record.setScanSource(response.getScanSource());
        record.setNotes(response.getNotes());
        record.setScannedAt(response.getScannedAt() != null ? response.getScannedAt() : LocalDateTime.now());
        return record;
    }

    /**
     * Convert JPA entity back to ScanResponse
     */
    public ScanResponse toDto(ScanRecord record) {
        ScanResponse dto = new ScanResponse();
        dto.setId(record.getId());
        dto.setOriginalUrl(record.getOriginalUrl());
        dto.setFinalDestinationUrl(record.getFinalDestinationUrl());
        dto.setDomain(record.getDomain());
        dto.setProviderName(record.getProviderName());
        dto.setIpAddress(record.getIpAddress());
        dto.setProtocol(record.getProtocol());
        dto.setHttps(record.isHttps());
        dto.setHasRedirects(record.isHasRedirects());
        dto.setRedirectCount(record.getRedirectCount());
        dto.setRiskScore(record.getRiskScore());
        dto.setRiskCategory(record.getRiskCategory());
        dto.setStatus(record.getStatus());
        if (record.getWarningSigns() != null && !record.getWarningSigns().isEmpty()) {
            dto.setWarningSigns(Arrays.asList(record.getWarningSigns().split("\\|\\|")));
        }
        if (record.getRecommendations() != null && !record.getRecommendations().isEmpty()) {
            dto.setSecurityRecommendations(Arrays.asList(record.getRecommendations().split("\\|\\|")));
        }
        dto.setScanSource(record.getScanSource());
        dto.setNotes(record.getNotes());
        dto.setScannedAt(record.getScannedAt());
        return dto;
    }
}
