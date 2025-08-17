package com.apartment.models.dtos.events;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class EventCreateRequest {
    private String title;
    
    private String description;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private String location;
    
    private String eventType; // Họp cư dân, Bảo trì, Cắt điện/nước, Sự kiện cộng đồng...
}
