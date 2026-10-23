package com.qrshield.backend.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityNotificationJpaRepository extends JpaRepository<SecurityNotification, String> {

    List<SecurityNotification> findAllByOrderByCreatedAtDesc();

    List<SecurityNotification> findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(String userId);
}
