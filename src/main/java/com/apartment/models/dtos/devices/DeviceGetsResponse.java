package com.apartment.models.dtos.devices;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeviceGetsResponse {
    private UUID id;
    private String deviceCode;
    private String deviceName;
    private String location;
    private String deviceType;
    private LocalDate installationDate;
    private LocalDate warrantyExpiry;
    private Integer maintenanceCycleDays;
    private LocalDate lastMaintenanceDate;
    private String status;
    private LocalDate nextMaintenanceDate; // Tính toán từ lastMaintenanceDate + maintenanceCycleDays
    private Boolean isMaintenanceDue; // Cảnh báo đến hạn bảo trì
}