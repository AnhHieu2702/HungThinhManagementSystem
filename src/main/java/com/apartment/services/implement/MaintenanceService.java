package com.apartment.services.implement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.maintenances.MaintenanceAssignRequest;
import com.apartment.models.dtos.maintenances.MaintenanceCreateRequest;
import com.apartment.models.dtos.maintenances.MaintenanceGetsResponse;
import com.apartment.models.dtos.maintenances.MaintenanceUpdateRequest;
import com.apartment.models.entities.bases.Device;
import com.apartment.models.entities.bases.Feedback;
import com.apartment.models.entities.bases.Maintenance;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.DeviceStatus;
import com.apartment.models.entities.enums.FeedbackStatus;
import com.apartment.models.entities.enums.MaintenanceStatus;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.DeviceRepository;
import com.apartment.repositories.FeedbackRepository;
import com.apartment.repositories.MaintenanceRepository;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.IMaintenanceService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceService implements IMaintenanceService {
    private final MaintenanceRepository maintenanceRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                            DeviceRepository deviceRepository,
                            UserRepository userRepository,
                            FeedbackRepository feedbackRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @Override
    public ApiResult<List<MaintenanceGetsResponse>> getsMaintenance() {
        List<Maintenance> maintenances = maintenanceRepository.findAll();
        List<MaintenanceGetsResponse> responseList = maintenances.stream()
                .map(this::mapToMaintenanceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách bảo trì thành công");
    }

    @Override
    public ApiResult<UUID> createMaintenance(MaintenanceCreateRequest apiRequest) {
        Device device = deviceRepository.findById(apiRequest.getDeviceId())
                .orElseThrow(() -> new UserMessageException("Thiết bị không tồn tại"));

        Maintenance newMaintenance = new Maintenance();
        newMaintenance.setDevice(device);
        newMaintenance.setDescription(apiRequest.getDescription());
        newMaintenance.setScheduledDate(apiRequest.getScheduledDate());
        newMaintenance.setMaintenanceType(apiRequest.getMaintenanceType());
        newMaintenance.setCost(apiRequest.getCost());
        newMaintenance.setNotes(apiRequest.getNotes());
        newMaintenance.setStatus(MaintenanceStatus.SCHEDULED);

        if (apiRequest.getTechnicianUsername() != null) {
            User technician = userRepository.findByUsername(apiRequest.getTechnicianUsername())
                    .orElseThrow(() -> new UserMessageException("Kỹ thuật viên không tồn tại"));
            newMaintenance.setTechnician(technician);
        }

        maintenanceRepository.save(newMaintenance);

        return ApiResult.success(newMaintenance.getId(), "Tạo lịch bảo trì thành công");
    }

    @Override
    public ApiResult<String> updateMaintenance(UUID maintenanceId, MaintenanceUpdateRequest apiRequest) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new UserMessageException("Lịch bảo trì không tồn tại"));

        if (apiRequest.getDescription() != null) {
            maintenance.setDescription(apiRequest.getDescription());
        }
        if (apiRequest.getScheduledDate() != null) {
            maintenance.setScheduledDate(apiRequest.getScheduledDate());
        }
        if (apiRequest.getCompletedDate() != null) {
            maintenance.setCompletedDate(apiRequest.getCompletedDate());
        }
        if (apiRequest.getCost() != null) {
            maintenance.setCost(apiRequest.getCost());
        }
        if (apiRequest.getNotes() != null) {
            maintenance.setNotes(apiRequest.getNotes());
        }
        if (apiRequest.getStatus() != null) {
            maintenance.setStatus(MaintenanceStatus.valueOf(apiRequest.getStatus()));
        }
        if (apiRequest.getTechnicianUsername() != null) {
            User technician = userRepository.findByUsername(apiRequest.getTechnicianUsername())
                    .orElseThrow(() -> new UserMessageException("Kỹ thuật viên không tồn tại"));
            maintenance.setTechnician(technician);
        }

        maintenanceRepository.save(maintenance);
        return ApiResult.success(null, "Cập nhật lịch bảo trì thành công");
    }

    @Override
    public ApiResult<String> assignMaintenance(UUID maintenanceId, MaintenanceAssignRequest apiRequest) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new UserMessageException("Lịch bảo trì không tồn tại"));

        User technician = userRepository.findByUsername(apiRequest.getTechnicianUsername())
                .orElseThrow(() -> new UserMessageException(
                        "Kỹ thuật viên không tồn tại với username: " + apiRequest.getTechnicianUsername()));

        maintenance.setTechnician(technician);
        maintenance.setStatus(MaintenanceStatus.IN_PROGRESS);
        maintenanceRepository.save(maintenance);

        return ApiResult.success(null, "Phân công bảo trì thành công");
    }

    @Override
    public ApiResult<List<MaintenanceGetsResponse>> getMaintenancesByStatus(String status) {
        MaintenanceStatus maintenanceStatus = MaintenanceStatus.valueOf(status);
        List<Maintenance> maintenances = maintenanceRepository.findByStatus(maintenanceStatus);
        List<MaintenanceGetsResponse> responseList = maintenances.stream()
                .map(this::mapToMaintenanceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách bảo trì theo trạng thái thành công");
    }

    @Override
    public ApiResult<List<MaintenanceGetsResponse>> getMaintenancesByDevice(UUID deviceId) {
        List<Maintenance> maintenances = maintenanceRepository.findByDeviceId(deviceId);
        List<MaintenanceGetsResponse> responseList = maintenances.stream()
                .map(this::mapToMaintenanceResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách bảo trì theo thiết bị thành công");
    }

    @Override
    @Transactional
    public ApiResult<String> completeMaintenance(UUID maintenanceId) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new UserMessageException("Lịch bảo trì không tồn tại"));

        // Cập nhật trạng thái bảo trì
        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenance.setCompletedDate(LocalDate.now());
        maintenanceRepository.save(maintenance);

        // Cập nhật ngày bảo trì cuối cùng của thiết bị
        Device device = maintenance.getDevice();
        device.setLastMaintenanceDate(LocalDate.now());
        device.setStatus(DeviceStatus.ACTIVE); // Thiết bị hoạt động bình thường sau bảo trì
        deviceRepository.save(device);

        return ApiResult.success(null, "Hoàn thành bảo trì thành công");
    }

    @Override
    @Transactional
    public ApiResult<UUID> createMaintenanceFromFeedback(UUID feedbackId, MaintenanceCreateRequest apiRequest) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new UserMessageException("Phản ánh không tồn tại"));

        // Tạo lịch bảo trì
        ApiResult<UUID> maintenanceResult = createMaintenance(apiRequest);

        // Cập nhật trạng thái phản ánh
        feedback.setStatus(FeedbackStatus.IN_PROGRESS);
        feedback.setResponse("Đã tạo lịch bảo trì để xử lý");
        feedbackRepository.save(feedback);

        return ApiResult.success(maintenanceResult.getData(), "Tạo lịch bảo trì từ phản ánh thành công");
    }

    // Phương thức tính tổng chi phí bảo trì theo thiết bị (thay thế @Query)
    public BigDecimal getTotalMaintenanceCostByDevice(UUID deviceId) {
        List<Maintenance> completedMaintenances = maintenanceRepository
                .findByDeviceIdAndStatusOrderByCompletedDateDesc(deviceId, MaintenanceStatus.COMPLETED);
        
        return completedMaintenances.stream()
                .map(Maintenance::getCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Phương thức lấy bảo trì gần nhất của thiết bị (thay thế @Query)
    public Maintenance getLatestMaintenanceByDevice(UUID deviceId) {
        List<Maintenance> maintenances = maintenanceRepository
                .findByDeviceIdAndStatusOrderByCompletedDateDesc(deviceId, MaintenanceStatus.COMPLETED);
        
        return maintenances.isEmpty() ? null : maintenances.get(0);
    }

    private MaintenanceGetsResponse mapToMaintenanceResponse(Maintenance maintenance) {
        MaintenanceGetsResponse response = new MaintenanceGetsResponse();
        response.setId(maintenance.getId());
        response.setDeviceId(maintenance.getDevice().getId());
        response.setDeviceCode(maintenance.getDevice().getDeviceCode());
        response.setDeviceName(maintenance.getDevice().getDeviceName());
        response.setDeviceLocation(maintenance.getDevice().getLocation());
        response.setDescription(maintenance.getDescription());
        response.setScheduledDate(maintenance.getScheduledDate());
        response.setCompletedDate(maintenance.getCompletedDate());
        response.setMaintenanceType(maintenance.getMaintenanceType());
        response.setStatus(maintenance.getStatus().getDisplayName());
        response.setCost(maintenance.getCost());
        response.setNotes(maintenance.getNotes());
        response.setTechnicianName(maintenance.getTechnician() != null ? 
                                   maintenance.getTechnician().getUsername() : "");

        return response;
    }
}