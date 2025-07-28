package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Feedback;
import com.apartment.models.entities.enums.FeedbackStatus;

public interface MobileFeedbackRepository extends JpaRepository<Feedback, UUID> {
    
    // Lấy tất cả phản ánh của một cư dân
    List<Feedback> findByResidentId(UUID residentId);
    
    // Lấy phản ánh của cư dân theo trạng thái
    List<Feedback> findByResidentIdAndStatus(UUID residentId, FeedbackStatus status);
    
    // Lấy phản ánh của cư dân theo loại
    List<Feedback> findByResidentIdAndCategory(UUID residentId, String category);
    
    // Kiểm tra quyền truy cập phản ánh
    Feedback findByIdAndResidentId(UUID feedbackId, UUID residentId);
    
    // Đếm số phản ánh chưa có phản hồi của cư dân
    long countByResidentIdAndResponseIsNull(UUID residentId);
}