package com.apartment.models.dtos.feedbacks;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackAssignRequest {
    @NotBlank(message = "Vui lòng chọn người xử lý")
    private String assignedToUsername;
}