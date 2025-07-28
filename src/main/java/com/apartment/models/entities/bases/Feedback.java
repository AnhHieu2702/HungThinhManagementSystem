package com.apartment.models.entities.bases;

import com.apartment.models.entities.enums.FeedbackStatus;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "feedbacks")
@Data
@EqualsAndHashCode(callSuper = true)
public class Feedback extends BaseEntity {
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    private User resident;
    
    // Thay đổi quan hệ với Apartment thông qua apartment_number
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_number", referencedColumnName = "apartment_number", nullable = false)
    private Apartment apartment;
    
    @Column(name = "category", length = 50)
    private String category; // Bảo trì, Khiếu nại, Đề xuất, Khẩn cấp, Khác
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FeedbackStatus status = FeedbackStatus.PENDING;
    
    @Column(name = "response", columnDefinition = "TEXT")
    private String response;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
}