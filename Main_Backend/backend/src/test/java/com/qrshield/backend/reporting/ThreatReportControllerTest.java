package com.qrshield.backend.reporting;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qrshield.backend.auth.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ThreatReportControllerTest {

    @Mock
    private ThreatReportService threatReportService;

    @Mock
    private JwtTokenService jwtTokenService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        ThreatReportController controller = new ThreatReportController(threatReportService, jwtTokenService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testSubmitThreatReportSuccess() throws Exception {
        ThreatReportRequest request = new ThreatReportRequest(
                "3a0fe90e-d6ce-4c43-aae8-1cbcf59b9456",
                "https://deceptive-login.net",
                "FALSE_NEGATIVE",
                "The QR code was glued over a legitimate parking meter sticker."
        );

        ThreatReportResponse response = new ThreatReportResponse(
                "rep_90184b2",
                "RECEIVED",
                "Thank you for reporting. Our threat intelligence team has queued this destination for review."
        );

        when(threatReportService.submitReport(any(), any(ThreatReportRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/scan/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportId", is("rep_90184b2")))
                .andExpect(jsonPath("$.status", is("RECEIVED")))
                .andExpect(jsonPath("$.message", containsString("queued this destination for review")));
    }
}
