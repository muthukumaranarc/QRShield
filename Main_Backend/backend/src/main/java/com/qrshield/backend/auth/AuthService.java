package com.qrshield.backend.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserJpaRepository userRepository;
    private final JwtTokenService jwtTokenService;
    private final ObjectMapper objectMapper;

    public AuthService(UserJpaRepository userRepository, 
                       JwtTokenService jwtTokenService,
                       ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.jwtTokenService = jwtTokenService;
        this.objectMapper = objectMapper;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with email '" + email + "' already exists.");
        }

        String salt = generateSalt();
        String passwordHash = hashPassword(request.getPassword(), salt);

        User user = new User(request.getName().trim(), email, passwordHash, salt);
        User savedUser = userRepository.save(user);
        log.info("Registered new user: id={}, email={}", savedUser.getId(), savedUser.getEmail());

        String token = jwtTokenService.generateToken(savedUser);
        return new AuthResponse(token, new UserProfileDto(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!verifyPassword(request.getPassword(), user.getPasswordHash(), user.getSalt())) {
            log.warn("Failed login attempt for user: {}", email);
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtTokenService.generateToken(user);
        return new AuthResponse(token, new UserProfileDto(user));
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        String idToken = request.getIdToken();
        String email = null;
        String name = "Google User";
        String avatarUrl = null;

        try {
            // Decode Google ID Token payload (JWT segment 1)
            String[] parts = idToken.split("\\.");
            if (parts.length >= 2) {
                byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
                JsonNode payload = objectMapper.readTree(decoded);
                email = payload.path("email").asText(null);
                if (payload.has("name")) {
                    name = payload.path("name").asText(name);
                }
                if (payload.has("picture")) {
                    avatarUrl = payload.path("picture").asText(null);
                }
            }
        } catch (Exception e) {
            log.warn("Could not decode Google ID token payload directly: {}", e.getMessage());
        }

        // If mock / test token passed
        if (email == null || email.trim().isEmpty()) {
            email = "user_" + Math.abs(idToken.hashCode()) + "@gmail.com";
        }

        email = email.toLowerCase().trim();
        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (avatarUrl != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty())) {
                user.setAvatarUrl(avatarUrl);
                user.setUpdatedAt(LocalDateTime.now());
                user = userRepository.save(user);
            }
        } else {
            user = new User(name, email, null, null);
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);
            log.info("Created new user via Google Sign-In: id={}, email={}", user.getId(), user.getEmail());
        }

        String token = jwtTokenService.generateToken(user);
        return new AuthResponse(token, new UserProfileDto(user));
    }

    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + userId));
        return new UserProfileDto(user);
    }

    public UserProfileDto updateUserProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        user.setUpdatedAt(LocalDateTime.now());

        User updated = userRepository.save(user);
        return new UserProfileDto(updated);
    }

    private String generateSalt() {
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    private String hashPassword(String password, String salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), Base64.getDecoder().decode(salt), ITERATIONS, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Password hashing failed", e);
        }
    }

    private boolean verifyPassword(String password, String expectedHash, String salt) {
        if (password == null || expectedHash == null || salt == null) {
            return false;
        }
        String computedHash = hashPassword(password, salt);
        return MessageDigest.isEqual(computedHash.getBytes(StandardCharsets.UTF_8), expectedHash.getBytes(StandardCharsets.UTF_8));
    }
}
