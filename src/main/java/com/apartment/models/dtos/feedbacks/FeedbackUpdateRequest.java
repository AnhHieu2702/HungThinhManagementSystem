package com.apartment.models.dtos.feedbacks;

import lombok.Data;

@Data
public class FeedbackUpdateRequest {
    private String response;
    private String status;
    private String assignedToUsername;  // ← Đổi từ UUID sang String
}