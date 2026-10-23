package com.qrshield.backend.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

/**
 * Lightweight, zero-dependency HMAC-SHA256 JWT Token Service.
 * Issues and validates signed tokens for mobile and web clients.
 */
@Service
public class JwtTokenService {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenService.class);
    private static final String HMAC_ALGO = "HmacSHA256";
    private static final long DEFAULT_EXPIRY_SECONDS = 30L * 24 * 3600; // 30 days

    private final String secretKey;
    private final ObjectMapper objectMapper;

    public JwtTokenService(@Value("${qrshield.auth.jwt-secret:qrshield-super-secure-jwt-secret-key-32bytes-minimum}") String secretKey,
                           ObjectMapper objectMapper) {
        this.secretKey = secretKey;
        this.objectMapper = objectMapper;
    }

    public String generateToken(User user) {
        long now = Instant.now().getEpochSecond();
        long exp = now + DEFAULT_EXPIRY_SECONDS;

        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> payload = Map.of(
                "sub", user.getId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : "",
                "iat", now,
                "exp", exp
        );

        try {
            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(header));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(objectMapper.writeValueAsBytes(payload));
            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(dataToSign);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            log.error("Failed to generate JWT token for user {}: {}", user.getId(), e.getMessage());
            throw new IllegalStateException("Could not generate auth token", e);
        }
    }

    public Optional<String> validateTokenAndGetUserId(String token) {
        if (token == null || token.trim().isEmpty()) {
            return Optional.empty();
        }

        String cleanToken = token.trim();
        if (cleanToken.startsWith("Bearer ") || cleanToken.startsWith("bearer ")) {
            cleanToken = cleanToken.substring(7).trim();
        }

        String[] parts = cleanToken.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        String dataToSign = parts[0] + "." + parts[1];
        String expectedSignature = sign(dataToSign);

        // Constant-time comparison to prevent timing attacks
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            log.warn("Invalid JWT signature received");
            return Optional.empty();
        }

        try {
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payloadNode = objectMapper.readTree(payloadBytes);

            long exp = payloadNode.path("exp").asLong(0);
            if (exp > 0 && exp < Instant.now().getEpochSecond()) {
                log.warn("JWT token has expired");
                return Optional.empty();
            }

            String userId = payloadNode.path("sub").asText(null);
            return Optional.ofNullable(userId);
        } catch (Exception e) {
            log.warn("Failed to parse JWT payload: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_ALGO);
            mac.init(keySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Error calculating HMAC signature", e);
        }
    }
}
