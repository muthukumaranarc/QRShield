package com.qrshield.backend.service;

import com.qrshield.backend.dto.ScanRequest;
import com.qrshield.backend.dto.ScanResponse;
import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanSource;
import com.qrshield.backend.entity.ScanStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class UrlAnalysisServiceTest {

    private UrlAnalysisService service;

    @BeforeEach
    void setUp() {
        service = new UrlAnalysisService();
        ReflectionTestUtils.setField(service, "timeoutMs", 2000);
        ReflectionTestUtils.setField(service, "maxRedirects", 3);
        ReflectionTestUtils.setField(service, "userAgent", "QRShield-Test");
    }

    @Test
    void testReputableDomainAnalysis() {
        ScanRequest request = new ScanRequest("https://www.google.com");
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertEquals(RiskCategory.LOW, response.getRiskCategory());
        assertTrue(response.getRiskScore() <= 30);
        assertTrue(response.getProviderName().contains("Google"));
        assertTrue(response.isHttps());
    }

    @Test
    void testBrandTyposquattingPhishing() {
        ScanRequest request = new ScanRequest("http://paypa1-account-verify.xyz/login.exe");
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertEquals(RiskCategory.HIGH, response.getRiskCategory());
        assertEquals(ScanStatus.DANGEROUS, response.getStatus());
        assertTrue(response.getRiskScore() >= 70);

        // Verify warning indicators
        String warnings = String.join(" ", response.getWarningSigns());
        assertTrue(warnings.contains("Brand Impersonation") || warnings.contains("Typosquatting") || warnings.contains("paypal"));
        assertTrue(warnings.contains("High-Risk TLD"));
        assertTrue(warnings.contains("Malware") || warnings.contains(".exe"));
    }

    @Test
    void testRawIpAddressHost() {
        ScanRequest request = new ScanRequest("http://192.168.1.1/admin/login");
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertTrue(response.getRiskScore() >= 40);
        String warnings = String.join(" ", response.getWarningSigns());
        assertTrue(warnings.contains("IP Address Hostname"));
    }

    @Test
    void testUrlShortenerDetection() {
        ScanRequest request = new ScanRequest("https://bit.ly/test-link");
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertTrue(response.getProviderName().contains("Shortener") || response.getProviderName().contains("bit.ly"));
        String warnings = String.join(" ", response.getWarningSigns());
        assertTrue(warnings.contains("URL Shortener Detected"));
    }

    @Test
    void testUpiPaymentScheme() {
        ScanRequest request = new ScanRequest("upi://pay?pa=shop@upi&pn=RetailStore&am=100.00", ScanSource.QR_CODE);
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertEquals(RiskCategory.LOW, response.getRiskCategory());
        assertEquals("NPCI / Unified Payments Interface", response.getProviderName());
        assertEquals("shop@upi", response.getDetails().get("payeeVpa"));
        assertEquals("RetailStore", response.getDetails().get("payeeName"));
    }

    @Test
    void testDangerousScriptScheme() {
        ScanRequest request = new ScanRequest("javascript:alert(document.cookie)");
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertEquals(RiskCategory.HIGH, response.getRiskCategory());
        assertEquals(ScanStatus.DANGEROUS, response.getStatus());
        assertTrue(response.getRiskScore() >= 90);
    }

    @Test
    void testUnresolvableUnknownDomainLimitation() {
        ScanRequest request = new ScanRequest("https://non-existent-sample-domain-98712398712.com");
        ScanResponse response = service.analyze(request);

        assertNotNull(response);
        assertEquals(ScanStatus.UNVERIFIED, response.getStatus());
        String warnings = String.join(" ", response.getWarningSigns());
        assertTrue(warnings.contains("LIMITATION NOTICE"));
    }
}
