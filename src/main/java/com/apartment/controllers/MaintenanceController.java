package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.maintenances.MaintenanceAssignRequest;
import com.apartment.models.dtos.maintenances.MaintenanceCreateRequest;
import com.apartment.models.dtos.maintenances.MaintenanceGetsResponse;
import com.apartment.models.dtos.maintenances.MaintenanceUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IMaintenanceService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api")
@Tag(name = "Maintenance Management")
public class MaintenanceController extends ApiBaseController {
    private final IMaintenanceService maintenanceService;

    public MaintenanceController(IMaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("admin-technician/maintenances")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<MaintenanceGetsResponse>>> getsMaintenance() {
        return executeApiResult(() -> maintenanceService.getsMaintenance());
    }

    @PostMapping("admin/maintenances")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<UUID>> createMaintenance(@Valid @RequestBody MaintenanceCreateRequest apiRequest) {
        return executeApiResult(() -> maintenanceService.createMaintenance(apiRequest));
    }

    @PutMapping("admin-technician/maintenances/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<String>> updateMaintenance(@PathVariable UUID id, 
                                                              @Valid @RequestBody MaintenanceUpdateRequest apiRequest) {
        return executeApiResult(() -> maintenanceService.updateMaintenance(id, apiRequest));
    }

    @PutMapping("admin/maintenances/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<String>> assignMaintenance(@PathVariable UUID id, 
                                                              @Valid @RequestBody MaintenanceAssignRequest apiRequest) {
        return executeApiResult(() -> maintenanceService.assignMaintenance(id, apiRequest));
    }

    @GetMapping("admin-technician/maintenances/status/{maintenanceStatus}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<MaintenanceGetsResponse>>> getMaintenancesByStatus(@PathVariable String maintenanceStatus) {
        return executeApiResult(() -> maintenanceService.getMaintenancesByStatus(maintenanceStatus));
    }

    @GetMapping("admin-technician/maintenances/device/{deviceId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<MaintenanceGetsResponse>>> getMaintenancesByDevice(@PathVariable UUID deviceId) {
        return executeApiResult(() -> maintenanceService.getMaintenancesByDevice(deviceId));
    }

    @PutMapping("technician/maintenances/{id}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<String>> completeMaintenance(@PathVariable UUID id) {
        return executeApiResult(() -> maintenanceService.completeMaintenance(id));
    }

    @PostMapping("admin/maintenances/from-feedback/{feedbackId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<UUID>> createMaintenanceFromFeedback(@PathVariable UUID feedbackId,
                                                                        @Valid @RequestBody MaintenanceCreateRequest apiRequest) {
        return executeApiResult(() -> maintenanceService.createMaintenanceFromFeedback(feedbackId, apiRequest));
    }
}