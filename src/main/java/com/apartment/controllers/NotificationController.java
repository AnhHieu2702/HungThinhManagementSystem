package com.apartment.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.notification.NotificationCreateRequest;
import com.apartment.models.dtos.notification.NotificationGetResponse;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.INotificationSerice;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Management")
public class NotificationController extends ApiBaseController{
    private final INotificationSerice notificationService;

    public NotificationController(INotificationSerice notificationService) {
        this.notificationService = notificationService;
    }
    
    /**
     * Lấy danh sách thông báo
     * @return ApiResult chứa danh sách thông báo
     */
    @GetMapping
    public ResponseEntity<ApiResult<List<NotificationGetResponse>>> getNotifications() {
        return executeApiResult(() -> notificationService.getNotificationById());
    }

    /**
     * Tạo thông báo mới
     * @param userId ID của người quản lý gửi thông báo
     * @param apiRequest Thông tin tạo thông báo
     * @return ApiResult chứa ID của thông báo mới tạo
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}")
    public ResponseEntity<ApiResult<UUID>> createNotification(@PathVariable UUID userId, @Valid @RequestBody NotificationCreateRequest apiRequest) {
        return executeApiResult(() -> notificationService.createNotification(userId, apiRequest));
    }
}
