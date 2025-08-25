package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.devices.DeviceCreateRequest;
import com.apartment.models.dtos.devices.DeviceGetsResponse;
import com.apartment.models.dtos.devices.DeviceUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IDeviceService;

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
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api")
@Tag(name = "Device Management")
public class DeviceController extends ApiBaseController {
    private final IDeviceService deviceService;

    public DeviceController(IDeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping("admin-technician/devices")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<DeviceGetsResponse>>> getsDevice() {
        return executeApiResult(() -> deviceService.getsDevice());
    }

    @PostMapping("admin/devices")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResult<UUID>> createDevice(@Valid @RequestBody DeviceCreateRequest apiRequest) {
        return executeApiResult(() -> deviceService.createDevice(apiRequest));
    }

    @PutMapping("admin/devices/{deviceCode}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResult<String>> updateDevice(@PathVariable String deviceCode,
            @Valid @RequestBody DeviceUpdateRequest apiRequest) {
        return executeApiResult(() -> deviceService.updateDeviceByCode(deviceCode, apiRequest));
    }

    @DeleteMapping("admin/devices/{deviceCode}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResult<String>> deleteDevice(@PathVariable String deviceCode) {
        return executeApiResult(() -> deviceService.deleteDeviceByCode(deviceCode));
    }

    @GetMapping("admin-technician/devices/status/{deviceStatus}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<DeviceGetsResponse>>> getDevicesByStatus(@PathVariable String deviceStatus) {
        return executeApiResult(() -> deviceService.getDevicesByStatus(deviceStatus));
    }
}