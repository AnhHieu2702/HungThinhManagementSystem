package com.apartment.models.dtos.devices;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DeviceUpdateRequest {
    private String deviceName;
    private String location;
    private String deviceType;
    private LocalDate warrantyExpiry;
    private Integer maintenanceCycleDays;
    private LocalDate lastMaintenanceDate;
    private String status;
}