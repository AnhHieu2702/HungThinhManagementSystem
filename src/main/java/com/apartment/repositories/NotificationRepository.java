package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Notification;
import com.apartment.models.entities.enums.TargetType;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByTargetType(TargetType targetType);
}
