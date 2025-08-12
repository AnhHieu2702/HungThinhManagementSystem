package com.apartment.models.dtos.maintenances;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceUpdateRequest {
    private String description;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private String technicianUsername;
    private String status;
    private BigDecimal cost;
    private String notes;
}