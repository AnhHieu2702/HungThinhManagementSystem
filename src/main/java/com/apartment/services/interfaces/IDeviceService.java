package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.devices.DeviceCreateRequest;
import com.apartment.models.dtos.devices.DeviceGetsResponse;
import com.apartment.models.dtos.devices.DeviceUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IDeviceService {
    ApiResult<List<DeviceGetsResponse>> getsDevice();
    
    ApiResult<UUID> createDevice(DeviceCreateRequest apiRequest);
    
    ApiResult<String> updateDevice(UUID deviceId, DeviceUpdateRequest apiRequest);
    
    ApiResult<String> deleteDevice(UUID deviceId);
    
    ApiResult<DeviceGetsResponse> getDeviceById(UUID deviceId);
    
    ApiResult<List<DeviceGetsResponse>> getDevicesByStatus(String status);
    
    ApiResult<List<DeviceGetsResponse>> getDevicesDueForMaintenance();
    
    ApiResult<List<DeviceGetsResponse>> getDevicesUpcomingMaintenance(int daysBefore);
}