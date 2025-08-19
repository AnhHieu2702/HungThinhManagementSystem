package com.apartment.models.dtos.notification;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationGetsResponse {
    private UUID id;

    private String title;

    private String content;

    private String senderName;

    private String sendTime;

    private String priority;
}
