package com.apartment.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Maintenance;
import com.apartment.models.entities.enums.MaintenanceStatus;

public interface MaintenanceRepository extends JpaRepository<Maintenance, UUID> {
    
    List<Maintenance> findByStatus(MaintenanceStatus status);
    
    List<Maintenance> findByTechnicianId(UUID technicianId);
    
    List<Maintenance> findByDeviceId(UUID deviceId);
    
    List<Maintenance> findByMaintenanceType(String maintenanceType);
    
    // Tìm bảo trì trong khoảng thời gian
    List<Maintenance> findByScheduledDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Tìm bảo trì đã hoàn thành theo deviceId, sắp xếp theo ngày hoàn thành giảm dần
    List<Maintenance> findByDeviceIdAndStatusOrderByCompletedDateDesc(UUID deviceId, MaintenanceStatus status);
    
    // Tìm bảo trì theo trạng thái và ngày lên lịch
    List<Maintenance> findByStatusAndScheduledDate(MaintenanceStatus status, LocalDate scheduledDate);
    
    // Tìm bảo trì theo kỹ thuật viên và trạng thái
    List<Maintenance> findByTechnicianIdAndStatus(UUID technicianId, MaintenanceStatus status);
    
    // Tìm bảo trì hoàn thành trong khoảng thời gian
    List<Maintenance> findByStatusAndCompletedDateBetween(MaintenanceStatus status, LocalDate startDate, LocalDate endDate);
}