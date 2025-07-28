package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Feedback;
import com.apartment.models.entities.enums.FeedbackStatus;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    
    List<Feedback> findByStatus(FeedbackStatus status);
    
    List<Feedback> findByResidentId(UUID residentId);
    
    List<Feedback> findByAssignedToId(UUID assignedToId);
    
    List<Feedback> findByApartmentApartmentNumber(String apartmentNumber);
    
    List<Feedback> findAllByOrderByCreatedAtDesc();
}