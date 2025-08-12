package com.apartment.models.dtos.mobilefeedbacks;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MobileFeedbackResponse {
    private UUID id;
    private String title;
    private String content;
    private String apartmentNumber;
    private String category;
    private String status;
    private String response;
    
    // Thông tin bổ sung cho yêu cầu bảo trì
    private String deviceCode;
    private String deviceLocation;
    private String priority;
    private String issueType;
}