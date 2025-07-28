package com.apartment.models.dtos.feedbacks;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackGetsResponse {
    private UUID id;
    private String title;
    private String content;
    private String residentName;
    private String apartmentNumber;
    private String category;
    private String status;
    private String response;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}