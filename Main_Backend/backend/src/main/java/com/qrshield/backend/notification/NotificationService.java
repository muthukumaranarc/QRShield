package com.qrshield.backend.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final DeviceTokenJpaRepository tokenRepository;
    private final SecurityNotificationJpaRepository notificationRepository;

    public NotificationService(DeviceTokenJpaRepository tokenRepository,
                               SecurityNotificationJpaRepository notificationRepository) {
        this.tokenRepository = tokenRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationActionResponse registerDeviceToken(String userId, RegisterTokenRequest request) {
        String tokenStr = request.getDeviceToken().trim();
        Optional<DeviceToken> existingOpt = tokenRepository.findByDeviceToken(tokenStr);

        DeviceToken token;
        if (existingOpt.isPresent()) {
            token = existingOpt.get();
            if (userId != null && !userId.isBlank()) {
                token.setUserId(userId);
            }
            if (request.getPlatform() != null) {
                token.setPlatform(request.getPlatform().toUpperCase());
            }
            token.setAllowSecurityAlerts(request.getAllowSecurityAlerts() != null ? request.getAllowSecurityAlerts() : true);
            token.setAllowWeeklySummary(request.getAllowWeeklySummary() != null ? request.getAllowWeeklySummary() : true);
            token.setUpdatedAt(LocalDateTime.now());
        } else {
            token = new DeviceToken(
                    userId,
                    tokenStr,
                    request.getPlatform(),
                    request.getAllowSecurityAlerts() != null ? request.getAllowSecurityAlerts() : true,
                    request.getAllowWeeklySummary() != null ? request.getAllowWeeklySummary() : true
            );
        }

        tokenRepository.save(token);
        log.info("Registered push token for device: platform={}, userId={}", token.getPlatform(), token.getUserId());
        return new NotificationActionResponse(true, "Push token registered successfully");
    }

    @Transactional
    public List<NotificationItemResponse> getNotifications(String userId) {
        // Seed default security advisories if empty so mobile NotificationsScreen has realistic content
        if (notificationRepository.count() == 0) {
            seedDefaultNotifications();
        }

        List<SecurityNotification> list;
        if (userId != null && !userId.isBlank()) {
            list = notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId);
        } else {
            list = notificationRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .map(NotificationItemResponse::new)
                .collect(Collectors.toList());
    }

    private void seedDefaultNotifications() {
        LocalDateTime now = LocalDateTime.now();

        SecurityNotification n1 = new SecurityNotification(
                "notif_001",
                null,
                "New QR Phishing Wave Detected",
                "Fake parking meter QR codes have been reported across metropolitan areas. Always verify payment domains.",
                "SECURITY_WARNING",
                false,
                now.minusHours(3)
        );

        SecurityNotification n2 = new SecurityNotification(
                "notif_002",
                null,
                "Compromised Shortlink Redirects",
                "Phishing actors are abusing bit.ly and tinyurl redirection chains to conceal malicious credential harvest forms.",
                "CRITICAL_ALERT",
                false,
                now.minusDays(1)
        );

        SecurityNotification n3 = new SecurityNotification(
                "notif_003",
                null,
                "QRShield Defense Engine v2.4 Active",
                "Zero-day download-to-hash sandbox pipeline and APK hash correlation algorithms are now live.",
                "SYSTEM_UPDATE",
                true,
                now.minusDays(3)
        );

        notificationRepository.saveAll(List.of(n1, n2, n3));
        log.info("Seeded initial security notifications and bulletins");
    }
}
