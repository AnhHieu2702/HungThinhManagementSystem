package com.apartment.models.dtos.residents;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResidentGetsResponse {
    private UUID apartmentId;

    private String apartmentNumber;

    private UUID id;

    private String fullname;

    private LocalDate dateOfBirth;

    private String email;

    private String phone;

    private String relation;

    private LocalDateTime lastModifiedTime;
    
    private LocalDateTime createTime;
}
