package com.qrshield.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private JwtTokenService jwtTokenService;

    private MockMvc authMockMvc;
    private MockMvc userMockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(authService);
        UserController userController = new UserController(authService, jwtTokenService);

        authMockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        userMockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Alex Johnson", "alex.johnson@example.com", "SecurePassword123!");
        UserProfileDto profile = new UserProfileDto("u_981a2f4c", "Alex Johnson", "alex.johnson@example.com", null, LocalDateTime.now());
        AuthResponse response = new AuthResponse("mock.jwt.token", profile);

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        authMockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", is("mock.jwt.token")))
                .andExpect(jsonPath("$.user.id", is("u_981a2f4c")))
                .andExpect(jsonPath("$.user.email", is("alex.johnson@example.com")));
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest("alex.johnson@example.com", "SecurePassword123!");
        UserProfileDto profile = new UserProfileDto("u_981a2f4c", "Alex Johnson", "alex.johnson@example.com", null, LocalDateTime.now());
        AuthResponse response = new AuthResponse("mock.jwt.token", profile);

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        authMockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("mock.jwt.token")))
                .andExpect(jsonPath("$.user.email", is("alex.johnson@example.com")));
    }

    @Test
    void testGoogleLoginSuccess() throws Exception {
        GoogleLoginRequest request = new GoogleLoginRequest("mock.google.id.token");
        UserProfileDto profile = new UserProfileDto("u_981a2f4c", "Alex Johnson", "alex.johnson@example.com", null, LocalDateTime.now());
        AuthResponse response = new AuthResponse("mock.jwt.token", profile);

        when(authService.googleLogin(any(GoogleLoginRequest.class))).thenReturn(response);

        authMockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is("mock.jwt.token")))
                .andExpect(jsonPath("$.user.id", is("u_981a2f4c")));
    }

    @Test
    void testGetUserProfileSuccess() throws Exception {
        String token = "Bearer mock.jwt.token";
        when(jwtTokenService.validateTokenAndGetUserId(token)).thenReturn(Optional.of("u_981a2f4c"));
        UserProfileDto profile = new UserProfileDto("u_981a2f4c", "Alex Johnson", "alex.johnson@example.com", null, LocalDateTime.now());
        when(authService.getUserProfile("u_981a2f4c")).thenReturn(profile);

        userMockMvc.perform(get("/api/user/profile")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("u_981a2f4c")))
                .andExpect(jsonPath("$.name", is("Alex Johnson")));
    }

    @Test
    void testGetUserProfileUnauthorized() throws Exception {
        userMockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUpdateUserProfileSuccess() throws Exception {
        String token = "Bearer mock.jwt.token";
        when(jwtTokenService.validateTokenAndGetUserId(token)).thenReturn(Optional.of("u_981a2f4c"));
        UpdateProfileRequest updateReq = new UpdateProfileRequest("Alex J.", "https://example.com/avatar.png");
        UserProfileDto profile = new UserProfileDto("u_981a2f4c", "Alex J.", "alex.johnson@example.com", "https://example.com/avatar.png", LocalDateTime.now());
        when(authService.updateUserProfile(any(), any())).thenReturn(profile);

        userMockMvc.perform(put("/api/user/profile")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Alex J.")))
                .andExpect(jsonPath("$.avatarUrl", is("https://example.com/avatar.png")));
    }
}
