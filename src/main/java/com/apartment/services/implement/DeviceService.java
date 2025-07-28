package com.apartment.services.implement;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.devices.DeviceCreateRequest;
import com.apartment.models.dtos.devices.DeviceGetsResponse;
import com.apartment.models.dtos.devices.DeviceUpdateRequest;
import com.apartment.models.entities.bases.Device;
import com.apartment.models.entities.enums.DeviceStatus;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.DeviceRepository;
import com.apartment.services.interfaces.IDeviceService;

import org.springframework.stereotype.Service;

@Service
public class DeviceService implements IDeviceService {
    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Override
    public ApiResult<List<DeviceGetsResponse>> getsDevice() {
        List<Device> devices = deviceRepository.findAll();
        List<DeviceGetsResponse> responseList = devices.stream()
                .map(this::mapToDeviceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thiết bị thành công");
    }

    @Override
    public ApiResult<UUID> createDevice(DeviceCreateRequest apiRequest) {
        // Kiểm tra mã thiết bị đã tồn tại
        if (deviceRepository.findByDeviceCode(apiRequest.getDeviceCode()).isPresent()) {
            throw new UserMessageException("Mã thiết bị đã tồn tại");
        }

        Device newDevice = new Device();
        newDevice.setDeviceCode(apiRequest.getDeviceCode());
        newDevice.setDeviceName(apiRequest.getDeviceName());
        newDevice.setLocation(apiRequest.getLocation());
        newDevice.setDeviceType(apiRequest.getDeviceType());
        newDevice.setInstallationDate(apiRequest.getInstallationDate());
        newDevice.setWarrantyExpiry(apiRequest.getWarrantyExpiry());
        newDevice.setMaintenanceCycleDays(apiRequest.getMaintenanceCycleDays());
        newDevice.setLastMaintenanceDate(apiRequest.getLastMaintenanceDate());
        newDevice.setStatus(DeviceStatus.ACTIVE);

        deviceRepository.save(newDevice);

        return ApiResult.success(newDevice.getId(), "Tạo thiết bị thành công");
    }

    @Override
    public ApiResult<String> updateDevice(UUID deviceId, DeviceUpdateRequest apiRequest) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new UserMessageException("Thiết bị không tồn tại"));

        if (apiRequest.getDeviceName() != null) {
            device.setDeviceName(apiRequest.getDeviceName());
        }
        if (apiRequest.getLocation() != null) {
            device.setLocation(apiRequest.getLocation());
        }
        if (apiRequest.getDeviceType() != null) {
            device.setDeviceType(apiRequest.getDeviceType());
        }
        if (apiRequest.getWarrantyExpiry() != null) {
            device.setWarrantyExpiry(apiRequest.getWarrantyExpiry());
        }
        if (apiRequest.getMaintenanceCycleDays() != null) {
            device.setMaintenanceCycleDays(apiRequest.getMaintenanceCycleDays());
        }
        if (apiRequest.getLastMaintenanceDate() != null) {
            device.setLastMaintenanceDate(apiRequest.getLastMaintenanceDate());
        }
        if (apiRequest.getStatus() != null) {
            device.setStatus(DeviceStatus.valueOf(apiRequest.getStatus()));
        }

        deviceRepository.save(device);
        return ApiResult.success(null, "Cập nhật thiết bị thành công");
    }

    @Override
    public ApiResult<String> deleteDevice(UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new UserMessageException("Thiết bị không tồn tại"));

        device.setStatus(DeviceStatus.INACTIVE);
        deviceRepository.save(device);
        return ApiResult.success(null, "Xóa thiết bị thành công");
    }

    @Override
    public ApiResult<DeviceGetsResponse> getDeviceById(UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new UserMessageException("Thiết bị không tồn tại"));

        DeviceGetsResponse response = mapToDeviceResponse(device);
        return ApiResult.success(response, "Lấy thông tin thiết bị thành công");
    }

    @Override
    public ApiResult<List<DeviceGetsResponse>> getDevicesByStatus(String status) {
        DeviceStatus deviceStatus = DeviceStatus.valueOf(status);
        List<Device> devices = deviceRepository.findByStatus(deviceStatus);
        List<DeviceGetsResponse> responseList = devices.stream()
                .map(this::mapToDeviceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thiết bị theo trạng thái thành công");
    }

    @Override
    public ApiResult<List<DeviceGetsResponse>> getDevicesDueForMaintenance() {
        LocalDate currentDate = LocalDate.now();
        List<Device> allDevices = deviceRepository.findAll();
        
        // Lọc thiết bị cần bảo trì bằng Java logic
        List<Device> devicesDue = allDevices.stream()
                .filter(device -> {
                    if (device.getLastMaintenanceDate() == null || device.getMaintenanceCycleDays() == null) {
                        return false;
                    }
                    LocalDate nextMaintenanceDate = device.getLastMaintenanceDate().plusDays(device.getMaintenanceCycleDays());
                    return !nextMaintenanceDate.isAfter(currentDate);
                })
                .collect(Collectors.toList());

        List<DeviceGetsResponse> responseList = devicesDue.stream()
                .map(this::mapToDeviceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thiết bị cần bảo trì thành công");
    }

    @Override
    public ApiResult<List<DeviceGetsResponse>> getDevicesUpcomingMaintenance(int daysBefore) {
        LocalDate currentDate = LocalDate.now();
        List<Device> allDevices = deviceRepository.findAll();
        
        // Lọc thiết bị sắp đến hạn bảo trì bằng Java logic
        List<Device> devicesUpcoming = allDevices.stream()
                .filter(device -> {
                    if (device.getLastMaintenanceDate() == null || device.getMaintenanceCycleDays() == null) {
                        return false;
                    }
                    LocalDate nextMaintenanceDate = device.getLastMaintenanceDate().plusDays(device.getMaintenanceCycleDays());
                    LocalDate alertDate = currentDate.plusDays(daysBefore);
                    return nextMaintenanceDate.isAfter(currentDate) && !nextMaintenanceDate.isAfter(alertDate);
                })
                .collect(Collectors.toList());

        List<DeviceGetsResponse> responseList = devicesUpcoming.stream()
                .map(this::mapToDeviceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thiết bị sắp đến hạn bảo trì thành công");
    }

    private DeviceGetsResponse mapToDeviceResponse(Device device) {
        DeviceGetsResponse response = new DeviceGetsResponse();
        response.setId(device.getId());
        response.setDeviceCode(device.getDeviceCode());
        response.setDeviceName(device.getDeviceName());
        response.setLocation(device.getLocation());
        response.setDeviceType(device.getDeviceType());
        response.setInstallationDate(device.getInstallationDate());
        response.setWarrantyExpiry(device.getWarrantyExpiry());
        response.setMaintenanceCycleDays(device.getMaintenanceCycleDays());
        response.setLastMaintenanceDate(device.getLastMaintenanceDate());
        response.setStatus(device.getStatus().getDisplayName());

        // Tính ngày bảo trì tiếp theo
        if (device.getLastMaintenanceDate() != null && device.getMaintenanceCycleDays() != null) {
            LocalDate nextMaintenanceDate = device.getLastMaintenanceDate().plusDays(device.getMaintenanceCycleDays());
            response.setNextMaintenanceDate(nextMaintenanceDate);
            response.setIsMaintenanceDue(nextMaintenanceDate.isBefore(LocalDate.now()) || nextMaintenanceDate.isEqual(LocalDate.now()));
        } else {
            response.setIsMaintenanceDue(false);
        }

        return response;
    }
}