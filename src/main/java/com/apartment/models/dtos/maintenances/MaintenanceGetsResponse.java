package com.apartment.models.dtos.maintenances;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceGetsResponse {
    private UUID id;
    private UUID deviceId;
    private String deviceCode;
    private String deviceName;
    private String deviceLocation;
    private String description;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private String technicianName;
    private String maintenanceType;
    private String status;
    private BigDecimal cost;
    private String notes;
}