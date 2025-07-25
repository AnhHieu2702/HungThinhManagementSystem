package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.apartment.models.entities.enums.Priority;
import com.apartment.models.entities.enums.TargetType;

@Entity
@Table(name = "notifications")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Notification extends BaseEntity {
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TargetType targetType;
    
    @Column(name = "target_value", length = 50)
    private String targetValue; // floor, block, apartment_id
    
    @Column(name = "send_time")
    @Builder.Default
    private LocalDateTime sendTime = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority;
}