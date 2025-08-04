package com.apartment.models.dtos.maintenances;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaintenanceCompleteRequest {
    private BigDecimal cost;
    private String notes;
}