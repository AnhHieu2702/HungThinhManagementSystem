package com.apartment.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Device;
import com.apartment.models.entities.enums.DeviceStatus;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    
    List<Device> findByStatus(DeviceStatus status);
    
    List<Device> findByDeviceType(String deviceType);
    
    List<Device> findByLocation(String location);
    
    Optional<Device> findByDeviceCode(String deviceCode);
    
    // Tìm thiết bị theo location chứa từ khóa
    List<Device> findByLocationContainingIgnoreCase(String location);
    
    // Tìm thiết bị theo tên chứa từ khóa
    List<Device> findByDeviceNameContainingIgnoreCase(String deviceName);
    
    // Tìm thiết bị theo loại và trạng thái
    List<Device> findByDeviceTypeAndStatus(String deviceType, DeviceStatus status);
}