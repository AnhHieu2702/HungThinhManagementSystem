package com.apartment.models.entities.bases;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.apartment.models.entities.enums.MaintenanceStatus;

@Entity
@Table(name = "maintenances")
@Data
@EqualsAndHashCode(callSuper = true)
public class Maintenance extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;
    
    @Column(name = "completed_date")
    private LocalDate completedDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;
    
    @Column(name = "maintenance_type", length = 50)
    private String maintenanceType; // Định kỳ, Sửa chữa, Khẩn cấp, Thay thế
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;
    
    @Column(name = "cost", precision = 15, scale = 2)
    private BigDecimal cost;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
