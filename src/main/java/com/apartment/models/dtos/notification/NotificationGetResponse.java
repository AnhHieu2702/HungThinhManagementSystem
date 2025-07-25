package com.apartment.models.dtos.notification;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationGetResponse {
    private String title;

    private String content;

    private String priority;

    private String senderName;

    private LocalDateTime sendTime;
}
