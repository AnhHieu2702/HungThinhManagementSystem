package com.apartment.models.dtos.mobilefeedbacks;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MobileFeedbackSummaryResponse {
    private UUID id;
    private String title;
    private String category;
    private String status;
    private boolean hasResponse; // Có phản hồi chưa
}