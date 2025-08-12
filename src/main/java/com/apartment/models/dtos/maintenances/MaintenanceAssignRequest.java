package com.apartment.models.dtos.maintenances;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MaintenanceAssignRequest {
    @NotBlank(message = "Vui lòng chọn kỹ thuật viên")
    private String technicianUsername;
}