package com.qrshield.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.InetAddress;

import static org.junit.jupiter.api.Assertions.*;

class UrlSecurityValidatorTest {

    private UrlSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlSecurityValidator();
    }

    @Test
    @DisplayName("Reject null or empty URLs")
    void testEmptyUrl() {
        UrlSecurityValidator.ValidationResult result = validator.validateUrl("");
        assertFalse(result.valid());
        assertTrue(result.failureReason().contains("null or empty"));
    }

    @Test
    @DisplayName("Reject non-HTTP/HTTPS schemes")
    void testDisallowedSchemes() {
        assertFalse(validator.validateUrl("ftp://example.com/test").valid());
        assertFalse(validator.validateUrl("file:///etc/passwd").valid());
        assertFalse(validator.validateUrl("javascript:alert(1)").valid());
        assertFalse(validator.validateUrl("gopher://example.com").valid());
    }

    @Test
    @DisplayName("Reject URLs with embedded userinfo credentials")
    void testEmbeddedCredentials() {
        UrlSecurityValidator.ValidationResult result = validator.validateUrl("http://admin:password123@google.com");
        assertFalse(result.valid());
        assertTrue(result.failureReason().contains("embedded user credentials"));
    }

    @Test
    @DisplayName("Reject loopback and localhost hostnames")
    void testLoopbackHostname() {
        UrlSecurityValidator.ValidationResult result = validator.validateUrl("http://localhost:8080/admin");
        assertFalse(result.valid());
        assertTrue(result.failureReason().contains("blocked"));
    }

    @Test
    @DisplayName("Reject cloud metadata endpoints")
    void testCloudMetadata() {
        UrlSecurityValidator.ValidationResult result = validator.validateUrl("http://169.254.169.254/latest/meta-data/");
        assertFalse(result.valid());
    }

    @Test
    @DisplayName("Reject restricted ports")
    void testRestrictedPorts() {
        UrlSecurityValidator.ValidationResult result = validator.validateUrl("https://example.com:22/ssh");
        assertFalse(result.valid());
        assertTrue(result.failureReason().contains("port"));
    }

    @Test
    @DisplayName("Identify restricted private IPv4 ranges")
    void testPrivateIpRanges() throws Exception {
        assertTrue(validator.isRestrictedIp(InetAddress.getByName("127.0.0.1")));
        assertTrue(validator.isRestrictedIp(InetAddress.getByName("10.10.10.10")));
        assertTrue(validator.isRestrictedIp(InetAddress.getByName("192.168.1.50")));
        assertTrue(validator.isRestrictedIp(InetAddress.getByName("172.16.0.1")));
        assertTrue(validator.isRestrictedIp(InetAddress.getByName("169.254.169.254")));
        assertTrue(validator.isRestrictedIp(InetAddress.getByName("224.0.0.1")));

        // Public IP
        assertFalse(validator.isRestrictedIp(InetAddress.getByName("8.8.8.8")));
        assertFalse(validator.isRestrictedIp(InetAddress.getByName("1.1.1.1")));
    }
}
