package com.qrshield.backend.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenJpaRepository extends JpaRepository<DeviceToken, String> {

    Optional<DeviceToken> findByDeviceToken(String deviceToken);

    List<DeviceToken> findByUserId(String userId);

    boolean existsByDeviceToken(String deviceToken);
}
