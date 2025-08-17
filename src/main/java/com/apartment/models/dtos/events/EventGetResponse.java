package com.apartment.models.dtos.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import groovy.transform.builder.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventGetResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String eventType;
    private String createdByName;
    private Boolean isPublic;
}