package com.apartment.models.dtos.events;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EventRegistrationRequest {
    @NotNull(message = "Vui lòng chọn sự kiện")
    private UUID eventId;
    
    private String notes; // Ghi chú khi đăng ký (nếu có)
}