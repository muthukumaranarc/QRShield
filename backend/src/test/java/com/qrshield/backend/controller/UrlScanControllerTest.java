package com.qrshield.backend.controller;

import com.qrshield.backend.entity.RiskCategory;
import com.qrshield.backend.entity.ScanRecord;
import com.qrshield.backend.entity.ScanStatus;
import com.qrshield.backend.repository.ScanRecordRepository;
import com.qrshield.backend.service.QrCodeDecodeService;
import com.qrshield.backend.service.ScanHistoryService;
import com.qrshield.backend.service.UrlAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UrlScanControllerTest {

    @Mock
    private ScanRecordRepository repository;

    private UrlAnalysisService analysisService;
    private ScanHistoryService historyService;
    private QrCodeDecodeService qrCodeDecodeService;

    private MockMvc mockMvc;
    private MockMvc healthMockMvc;

    @BeforeEach
    void setUp() {
        analysisService = new UrlAnalysisService();
        ReflectionTestUtils.setField(analysisService, "timeoutMs", 2000);
        ReflectionTestUtils.setField(analysisService, "maxRedirects", 3);
        ReflectionTestUtils.setField(analysisService, "userAgent", "QRShield-Test");

        historyService = new ScanHistoryService(repository, analysisService);
        qrCodeDecodeService = new QrCodeDecodeService();

        UrlScanController scanController = new UrlScanController(analysisService, historyService, qrCodeDecodeService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(scanController).build();

        HealthController healthController = new HealthController();
        this.healthMockMvc = MockMvcBuilders.standaloneSetup(healthController).build();
    }

    @Test
    void testHealthEndpoint() throws Exception {
        healthMockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("QRShield Backend Cybersecurity API"));
    }

    @Test
    void testAnalyzeEndpointWithSafeUrl() throws Exception {
        when(repository.save(any(ScanRecord.class))).thenAnswer(invocation -> {
            ScanRecord record = invocation.getArgument(0);
            record.setId("mongo_id_12345");
            return record;
        });

        String jsonPayload = """
                {
                    "url": "https://www.google.com",
                    "source": "QR_CODE",
                    "notes": "Testing legitimate QR code"
                }
                """;

        mockMvc.perform(post("/api/scan/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("mongo_id_12345"))
                .andExpect(jsonPath("$.domain").value("www.google.com"))
                .andExpect(jsonPath("$.riskCategory").value("LOW"))
                .andExpect(jsonPath("$.providerName").value(containsString("Google")))
                .andExpect(jsonPath("$.https").value(true));
    }

    @Test
    void testAnalyzeEndpointWithPhishingUrl() throws Exception {
        when(repository.save(any(ScanRecord.class))).thenAnswer(invocation -> {
            ScanRecord record = invocation.getArgument(0);
            record.setId("mongo_phish_999");
            return record;
        });

        String jsonPayload = """
                {
                    "url": "http://paypa1-update-security.xyz/login.exe",
                    "source": "MANUAL_URL",
                    "notes": "Testing phishing detection"
                }
                """;

        mockMvc.perform(post("/api/scan/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskCategory").value("HIGH"))
                .andExpect(jsonPath("$.status").value("DANGEROUS"))
                .andExpect(jsonPath("$.riskScore").value(greaterThanOrEqualTo(70)))
                .andExpect(jsonPath("$.warningSigns", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.securityRecommendations", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void testHistoryAndStatsEndpoints() throws Exception {
        ScanRecord dummyRecord = new ScanRecord();
        dummyRecord.setId("65f12a34bc");
        dummyRecord.setOriginalUrl("https://github.com");
        dummyRecord.setDomain("github.com");
        dummyRecord.setRiskScore(0);
        dummyRecord.setRiskCategory(RiskCategory.LOW);
        dummyRecord.setStatus(ScanStatus.SAFE);

        when(repository.findAllByOrderByScannedAtDesc()).thenReturn(List.of(dummyRecord));
        when(repository.count()).thenReturn(1L);
        when(repository.countByRiskCategory(RiskCategory.LOW)).thenReturn(1L);
        when(repository.findTop10ByOrderByScannedAtDesc()).thenReturn(List.of(dummyRecord));

        // Test history
        mockMvc.perform(get("/api/scan/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].domain").value("github.com"));

        // Test stats
        mockMvc.perform(get("/api/scan/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalScans").value(1))
                .andExpect(jsonPath("$.lowRiskCount").value(1))
                .andExpect(jsonPath("$.recentScans", hasSize(1)));
    }
}
