package com.apartment.models.dtos.apartments;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApartmentGetsResponse {
    private UUID id;  

    private String apartmentNumber;

    private Integer floor;

    private String block;

    private BigDecimal area;

    private String status;
}
