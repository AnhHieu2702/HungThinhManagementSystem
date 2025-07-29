package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Feedback;
import com.apartment.models.entities.enums.FeedbackStatus;

public interface MobileFeedbackRepository extends JpaRepository<Feedback, UUID> {
    // Existing methods (unchanged)
    List<Feedback> findByResidentId(UUID residentId);

    List<Feedback> findByResidentIdAndStatus(UUID residentId, FeedbackStatus status);

    List<Feedback> findByResidentIdAndCategory(UUID residentId, String category);

    Feedback findByIdAndResidentId(UUID feedbackId, UUID residentId);

    long countByResidentIdAndResponseIsNull(UUID residentId);
    
    // Methods với sắp xếp theo ID
    List<Feedback> findByResidentIdOrderByIdDesc(UUID residentId);

    List<Feedback> findByResidentIdAndStatusOrderByIdDesc(UUID residentId, FeedbackStatus status);

    List<Feedback> findByResidentIdAndCategoryOrderByIdDesc(UUID residentId, String category);

    List<Feedback> findByResidentIdAndStatusAndCategoryOrderByIdDesc(UUID residentId, FeedbackStatus status,
            String category);
}