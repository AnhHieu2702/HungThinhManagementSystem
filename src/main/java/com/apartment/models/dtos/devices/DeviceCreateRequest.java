package com.apartment.models.dtos.devices;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DeviceCreateRequest {
    @NotBlank(message = "Vui lòng nhập mã thiết bị")
    private String deviceCode;

    @NotBlank(message = "Vui lòng nhập tên thiết bị")
    private String deviceName;

    @NotBlank(message = "Vui lòng nhập vị trí thiết bị")
    private String location;

    @NotBlank(message = "Vui lòng nhập loại thiết bị")
    private String deviceType;

    @NotNull(message = "Vui lòng chọn ngày lắp đặt")
    private LocalDate installationDate;

    private LocalDate warrantyExpiry;

    @NotNull(message = "Vui lòng nhập chu kỳ bảo trì (ngày)")
    private Integer maintenanceCycleDays;

    private LocalDate lastMaintenanceDate;
}