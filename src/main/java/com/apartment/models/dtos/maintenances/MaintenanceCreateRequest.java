package com.apartment.models.dtos.maintenances;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class MaintenanceCreateRequest {
    @NotNull(message = "Vui lòng chọn thiết bị")
    private UUID deviceId;

    @NotBlank(message = "Vui lòng nhập mô tả công việc")
    private String description;

    @NotNull(message = "Vui lòng chọn ngày lên lịch")
    private LocalDate scheduledDate;

    private String technicianUsername; // Username của kỹ thuật viên

    @NotBlank(message = "Vui lòng chọn loại bảo trì")
    private String maintenanceType; // Định kỳ, Sửa chữa, Khẩn cấp, Thay thế

    private BigDecimal cost;
    private String notes;
}