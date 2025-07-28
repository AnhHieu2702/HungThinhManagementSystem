package com.apartment.models.dtos.feedbacks;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class FeedbackAssignRequest {
    @NotNull(message = "Vui lòng chọn người xử lý")
    private UUID assignedTo;
}