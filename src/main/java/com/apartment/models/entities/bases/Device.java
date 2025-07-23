package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

import com.apartment.models.entities.enums.DeviceStatus;

@Entity
@Table(name = "devices")
@Data
@EqualsAndHashCode(callSuper = true)
public class Device extends BaseEntity {
    
    @Column(name = "device_code", unique = true, nullable = false, length = 50)
    private String deviceCode;
    
    @Column(name = "device_name", nullable = false, length = 200)
    private String deviceName;
    
    @Column(name = "location", length = 200)
    private String location;
    
    @Column(name = "device_type", length = 100)
    private String deviceType; // Thang máy, Máy phát điện, Máy bơm, Camera, Cổng, Đèn...
    
    @Column(name = "installation_date")
    private LocalDate installationDate;
    
    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;
    
    @Column(name = "maintenance_cycle_days")
    private Integer maintenanceCycleDays;
    
    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeviceStatus status = DeviceStatus.ACTIVE;
}
