package com.apartment.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Event;

public interface EventRepository extends JpaRepository<Event, UUID> {
    
    List<Event> findByIsPublicTrue();
    
    List<Event> findByStartTimeAfter(LocalDateTime dateTime);
    
    List<Event> findByIsPublicTrueAndStartTimeAfter(LocalDateTime dateTime);
    
    List<Event> findByEventType(String eventType);
    
    List<Event> findByIsPublicTrueAndStartTimeAfterOrderByStartTimeAsc(LocalDateTime dateTime);
    
    // Method mới để hỗ trợ filter theo eventType
    List<Event> findByIsPublicTrueAndStartTimeAfterAndEventTypeOrderByStartTimeAsc(LocalDateTime dateTime, String eventType);
}