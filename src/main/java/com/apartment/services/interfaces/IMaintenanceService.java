package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.maintenances.MaintenanceAssignRequest;
import com.apartment.models.dtos.maintenances.MaintenanceCreateRequest;
import com.apartment.models.dtos.maintenances.MaintenanceGetsResponse;
import com.apartment.models.dtos.maintenances.MaintenanceUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IMaintenanceService {
    ApiResult<List<MaintenanceGetsResponse>> getsMaintenance(String status, UUID deviceId, String technicianUsername, String maintenanceType);
    
    ApiResult<UUID> createMaintenance(MaintenanceCreateRequest apiRequest);
    
    ApiResult<String> updateMaintenance(UUID maintenanceId, MaintenanceUpdateRequest apiRequest);
    
    ApiResult<String> assignMaintenance(UUID maintenanceId, MaintenanceAssignRequest apiRequest);
    
    ApiResult<List<MaintenanceGetsResponse>> getMaintenancesByDevice(UUID deviceId);
    
    ApiResult<String> completeMaintenance(UUID maintenanceId);
}