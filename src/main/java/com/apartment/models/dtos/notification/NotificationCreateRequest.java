package com.apartment.models.dtos.notification;


import com.apartment.models.entities.enums.Priority;
import com.apartment.models.entities.enums.TargetType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationCreateRequest {
    @NotBlank(message = "Vui lòng nhập tiêu đề thông báo")
    private String title;

    private String content;

    @NotNull(message = "Vui lòng chọn loại đối tượng nhận thông báo")
    private TargetType targetType;

    private String targetValue;

    private Priority priority;
}
