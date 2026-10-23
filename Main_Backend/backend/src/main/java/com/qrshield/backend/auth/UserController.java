package com.qrshield.backend.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final AuthService authService;
    private final JwtTokenService jwtTokenService;

    public UserController(AuthService authService, JwtTokenService jwtTokenService) {
        this.authService = authService;
        this.jwtTokenService = jwtTokenService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<String> userIdOpt = jwtTokenService.validateTokenAndGetUserId(authHeader);
        if (userIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Missing or invalid Bearer authorization token"));
        }

        try {
            UserProfileDto profile = authService.getUserProfile(userIdOpt.get());
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        Optional<String> userIdOpt = jwtTokenService.validateTokenAndGetUserId(authHeader);
        if (userIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Missing or invalid Bearer authorization token"));
        }

        try {
            UserProfileDto updated = authService.updateUserProfile(userIdOpt.get(), request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    public record ErrorResponse(String message) {}
}
