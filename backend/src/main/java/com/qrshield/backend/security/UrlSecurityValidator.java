package com.qrshield.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.*;
import java.util.*;

/**
 * Validates untrusted URLs before passing them to the browser sandbox or HTTP client.
 * Mitigates SSRF, internal network scanning, cloud metadata access, and DNS rebinding risks.
 */
@Component
public class UrlSecurityValidator {

    private static final Logger log = LoggerFactory.getLogger(UrlSecurityValidator.class);

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    // Prohibited domains / hostnames (cloud metadata, internal DNS, local domains)
    private static final Set<String> BLOCKED_HOSTNAMES = Set.of(
            "localhost",
            "metadata.google.internal",
            "instance-data",
            "169.254.169.254"
    );

    public record ValidationResult(boolean valid, String sanitizedUrl, InetAddress resolvedAddress, String failureReason) {
        public static ValidationResult success(String url, InetAddress addr) {
            return new ValidationResult(true, url, addr, null);
        }

        public static ValidationResult failure(String reason) {
            return new ValidationResult(false, null, null, reason);
        }
    }

    /**
     * Comprehensive validation of a candidate URL:
     * 1. Syntax & structure check
     * 2. Scheme whitelist (HTTP/HTTPS only)
     * 3. Credentials rejection (userinfo)
     * 4. Port restrictions (default 80, 443, 8080, 8443)
     * 5. DNS resolution and IP range blocking (RFC 1918, loopback, link-local, multicast, cloud metadata)
     */
    public ValidationResult validateUrl(String candidateUrl) {
        if (candidateUrl == null || candidateUrl.trim().isEmpty()) {
            return ValidationResult.failure("URL is null or empty");
        }

        String trimmed = candidateUrl.trim();

        // 1. Basic URL parsing
        URI uri;
        try {
            uri = new URI(trimmed);
        } catch (URISyntaxException e) {
            return ValidationResult.failure("Malformed URL syntax: " + e.getMessage());
        }

        // 2. Allowed schemes check
        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase(Locale.ROOT))) {
            return ValidationResult.failure("Scheme '" + scheme + "' is rejected. Only HTTP and HTTPS are permitted for sandbox inspection.");
        }

        // 3. Reject embedded user credentials (e.g., http://admin:pass@host)
        if (uri.getUserInfo() != null && !uri.getUserInfo().isEmpty()) {
            return ValidationResult.failure("URLs containing embedded user credentials (userinfo) are prohibited for security.");
        }

        // 4. Hostname validation
        String host = uri.getHost();
        if (host == null || host.trim().isEmpty()) {
            return ValidationResult.failure("URL lacks a valid hostname.");
        }

        String normalizedHost = host.toLowerCase(Locale.ROOT).trim();

        if (BLOCKED_HOSTNAMES.contains(normalizedHost) || normalizedHost.endsWith(".localhost") || normalizedHost.endsWith(".internal") || normalizedHost.endsWith(".local")) {
            return ValidationResult.failure("Host '" + normalizedHost + "' is an internal, local, or cloud metadata name and is blocked.");
        }

        // 5. Port restriction check
        int port = uri.getPort();
        if (port != -1 && port != 80 && port != 443 && port != 8080 && port != 8443) {
            return ValidationResult.failure("Port " + port + " is not in the allowed web inspection port list (80, 443, 8080, 8443).");
        }

        // 6. DNS Resolution & SSRF IP address inspection
        InetAddress[] resolvedAddresses;
        try {
            resolvedAddresses = InetAddress.getAllByName(normalizedHost);
        } catch (UnknownHostException e) {
            return ValidationResult.failure("DNS resolution failed for hostname '" + normalizedHost + "': host cannot be resolved.");
        } catch (SecurityException e) {
            return ValidationResult.failure("Security manager denied DNS resolution for host: " + normalizedHost);
        }

        if (resolvedAddresses == null || resolvedAddresses.length == 0) {
            return ValidationResult.failure("No IP addresses returned for host: " + normalizedHost);
        }

        // If ANY resolved IP belongs to a restricted/private network, reject entirely (DNS rebinding mitigation)
        for (InetAddress addr : resolvedAddresses) {
            if (isRestrictedIp(addr)) {
                log.warn("Blocked SSRF attempt targeting restricted IP {} for host {}", addr.getHostAddress(), normalizedHost);
                return ValidationResult.failure("Host '" + normalizedHost + "' resolved to restricted address (" + addr.getHostAddress() + "). Access is blocked.");
            }
        }

        return ValidationResult.success(uri.toString(), resolvedAddresses[0]);
    }

    /**
     * Determines whether an IP address belongs to internal, private, loopback, link-local,
     * carrier-grade NAT, or cloud metadata ranges.
     */
    public boolean isRestrictedIp(InetAddress address) {
        if (address.isLoopbackAddress() || address.isAnyLocalAddress() || address.isLinkLocalAddress() || address.isSiteLocalAddress() || address.isMulticastAddress()) {
            return true;
        }

        byte[] bytes = address.getAddress();

        if (bytes.length == 4) { // IPv4
            int b0 = bytes[0] & 0xFF;
            int b1 = bytes[1] & 0xFF;

            // 0.0.0.0/8 (Current network)
            if (b0 == 0) return true;

            // 10.0.0.0/8 (RFC 1918 Private)
            if (b0 == 10) return true;

            // 100.64.0.0/10 (Carrier-grade NAT)
            if (b0 == 100 && (b1 >= 64 && b1 <= 127)) return true;

            // 127.0.0.0/8 (Loopback)
            if (b0 == 127) return true;

            // 169.254.0.0/16 (Link-Local & Cloud Metadata, e.g. 169.254.169.254)
            if (b0 == 169 && b1 == 254) return true;

            // 172.16.0.0/12 (RFC 1918 Private)
            if (b0 == 172 && (b1 >= 16 && b1 <= 31)) return true;

            // 192.168.0.0/16 (RFC 1918 Private)
            if (b0 == 192 && b1 == 168) return true;

            // 192.0.2.0/24 (TEST-NET-1), 198.51.100.0/24 (TEST-NET-2), 203.0.113.0/24 (TEST-NET-3)
            if (b0 == 192 && b1 == 0 && (bytes[2] & 0xFF) == 2) return true;
            if (b0 == 198 && b1 == 51 && (bytes[2] & 0xFF) == 100) return true;
            if (b0 == 203 && b1 == 0 && (bytes[2] & 0xFF) == 113) return true;

            // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved / Future use)
            if (b0 >= 224) return true;

        } else if (bytes.length == 16) { // IPv6
            int b0 = bytes[0] & 0xFF;
            int b1 = bytes[1] & 0xFF;

            // IPv6 Loopback (::1) and Unspecified (::)
            boolean allZeroExceptLast = true;
            for (int i = 0; i < 15; i++) {
                if (bytes[i] != 0) {
                    allZeroExceptLast = false;
                    break;
                }
            }
            if (allZeroExceptLast && (bytes[15] == 0 || bytes[15] == 1)) {
                return true;
            }

            // IPv6 Unique Local Address (fc00::/7 -> fc00 to fdff)
            if ((b0 & 0xFE) == 0xFC) return true;

            // IPv6 Link-Local (fe80::/10 -> fe80 to febf)
            if (b0 == 0xFE && (b1 & 0xC0) == 0x80) return true;

            // IPv4-mapped IPv6 addresses (::ffff:0:0/96)
            if (bytes[0] == 0 && bytes[1] == 0 && bytes[2] == 0 && bytes[3] == 0 &&
                bytes[4] == 0 && bytes[5] == 0 && bytes[6] == 0 && bytes[7] == 0 &&
                bytes[8] == 0 && bytes[9] == 0 && (bytes[10] & 0xFF) == 0xFF && (bytes[11] & 0xFF) == 0xFF) {
                byte[] ipv4Bytes = Arrays.copyOfRange(bytes, 12, 16);
                try {
                    return isRestrictedIp(InetAddress.getByAddress(ipv4Bytes));
                } catch (UnknownHostException ignored) {}
            }
        }

        return false;
    }
}
