package com.qrshield.backend.notification;

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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private JwtTokenService jwtTokenService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        NotificationController controller = new NotificationController(notificationService, jwtTokenService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testRegisterToken() throws Exception {
        RegisterTokenRequest req = new RegisterTokenRequest(
                "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
                "ANDROID",
                true,
                true
        );
        NotificationActionResponse resp = new NotificationActionResponse(true, "Push token registered successfully");

        when(notificationService.registerDeviceToken(any(), any(RegisterTokenRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/notifications/register-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Push token registered successfully")));
    }

    @Test
    void testGetNotifications() throws Exception {
        NotificationItemResponse n1 = new NotificationItemResponse(
                "notif_001",
                "New QR Phishing Wave Detected",
                "Fake parking meter QR codes have been reported across metropolitan areas. Always verify payment domains.",
                "SECURITY_WARNING",
                false,
                LocalDateTime.now()
        );

        when(notificationService.getNotifications(any())).thenReturn(List.of(n1));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("notif_001")))
                .andExpect(jsonPath("$[0].title", containsString("New QR Phishing Wave")))
                .andExpect(jsonPath("$[0].read", is(false)));
    }
}
