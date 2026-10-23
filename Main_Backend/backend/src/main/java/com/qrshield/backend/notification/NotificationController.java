package com.qrshield.backend.notification;

import com.qrshield.backend.auth.JwtTokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenService jwtTokenService;

    public NotificationController(NotificationService notificationService, JwtTokenService jwtTokenService) {
        this.notificationService = notificationService;
        this.jwtTokenService = jwtTokenService;
    }

    private String extractUserId(String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            Optional<String> userIdOpt = jwtTokenService.validateTokenAndGetUserId(authHeader);
            if (userIdOpt.isPresent()) {
                return userIdOpt.get();
            }
        }
        return null;
    }

    @PostMapping("/register-token")
    public ResponseEntity<NotificationActionResponse> registerToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody RegisterTokenRequest request) {

        String userId = extractUserId(authHeader);
        NotificationActionResponse response = notificationService.registerDeviceToken(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<NotificationItemResponse>> getNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String userId = extractUserId(authHeader);
        List<NotificationItemResponse> notifications = notificationService.getNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
}
