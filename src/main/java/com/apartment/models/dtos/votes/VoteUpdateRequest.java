package com.apartment.models.dtos.votes;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VoteUpdateRequest {
    private String title;
    private String description;
    private LocalDateTime endDate;
    private String status; // DRAFT, ACTIVE, COMPLETED, CANCELLED
}