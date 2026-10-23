package com.qrshield.backend.blocklist;

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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BlocklistControllerTest {

    @Mock
    private BlocklistService blocklistService;

    @Mock
    private JwtTokenService jwtTokenService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        BlocklistController controller = new BlocklistController(blocklistService, jwtTokenService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetBlockedDomains() throws Exception {
        when(jwtTokenService.validateTokenAndGetUserId("Bearer test-token")).thenReturn(Optional.of("u_123"));
        BlockedDomainResponse r1 = new BlockedDomainResponse("b_1a2b3c", "phishing-bank-alerts.com", "Phishing SMS scam", LocalDateTime.now());
        when(blocklistService.getBlockedDomains("u_123")).thenReturn(List.of(r1));

        mockMvc.perform(get("/api/user/blocked-domains")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("b_1a2b3c")))
                .andExpect(jsonPath("$[0].domain", is("phishing-bank-alerts.com")));
    }

    @Test
    void testAddBlockedDomain() throws Exception {
        when(jwtTokenService.validateTokenAndGetUserId("Bearer test-token")).thenReturn(Optional.of("u_123"));
        AddBlockedDomainRequest req = new AddBlockedDomainRequest("malicious-giftcards.xyz", "Fake promotional flyer");
        BlockedDomainResponse created = new BlockedDomainResponse("b_789xyz", "malicious-giftcards.xyz", "Fake promotional flyer", LocalDateTime.now());
        when(blocklistService.addBlockedDomain(eq("u_123"), any())).thenReturn(created);

        mockMvc.perform(post("/api/user/blocked-domains")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("b_789xyz")))
                .andExpect(jsonPath("$.domain", is("malicious-giftcards.xyz")));
    }

    @Test
    void testRemoveBlockedDomainSuccess() throws Exception {
        when(jwtTokenService.validateTokenAndGetUserId("Bearer test-token")).thenReturn(Optional.of("u_123"));
        when(blocklistService.removeBlockedDomain("u_123", "b_1a2b3c")).thenReturn(true);

        mockMvc.perform(delete("/api/user/blocked-domains/b_1a2b3c")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Domain unblocked successfully")));
    }

    @Test
    void testRemoveBlockedDomainNotFound() throws Exception {
        when(jwtTokenService.validateTokenAndGetUserId(any())).thenReturn(Optional.of("u_123"));
        when(blocklistService.removeBlockedDomain("u_123", "b_nonexistent")).thenReturn(false);

        mockMvc.perform(delete("/api/user/blocked-domains/b_nonexistent")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }
}
