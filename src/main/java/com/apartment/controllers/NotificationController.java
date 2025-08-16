package com.apartment.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;

import com.apartment.models.dtos.notification.NotificationCreateRequest;
import com.apartment.models.dtos.notification.NotificationGetResponse;
import com.apartment.models.dtos.notification.NotificationGetsResponse;
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
    public ResponseEntity<ApiResult<List<NotificationGetsResponse>>> getNotifications() {
        return executeApiResult(() -> notificationService.getsNotification());
    }

    /**
     * Lấy thông báo theo ID
     * @param id ID của thông báo cần lấy
     * @return ApiResult chứa thông tin chi tiết của thông báo
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<ApiResult<NotificationGetResponse>> getNotification(@PathVariable UUID notificationId) {
        return executeApiResult(() -> notificationService.getNotification(notificationId));
    }

    /**
     * Tạo thông báo mới
     * @param userId ID của người quản lý gửi thông báo
     * @param apiRequest Thông tin tạo thông báo
     * @return ApiResult chứa ID của thông báo mới tạo
     */
    @PostMapping
    public ResponseEntity<ApiResult<UUID>> createNotification(Authentication authentication, @Valid @RequestBody NotificationCreateRequest apiRequest) {
        return executeApiResult(() -> notificationService.createNotification(authentication, apiRequest));
    }
}
