package com.apartment.models.dtos.feedbacks;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class FeedbackUpdateRequest {
    @NotBlank(message = "Vui lòng nhập phản hồi")
    private String response;

    @NotBlank(message = "Vui lòng chọn trạng thái")
    private String status;

    private UUID assignedTo; // ID của người được phân công xử lý
}