package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;

import com.apartment.models.dtos.notification.NotificationCreateRequest;
import com.apartment.models.dtos.notification.NotificationGetResponse;
import com.apartment.models.dtos.notification.NotificationGetsResponse;
import com.apartment.models.dtos.notification.NotificationUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface INotificationSerice {
    ApiResult<List<NotificationGetsResponse>> getsNotification();

    ApiResult<NotificationGetResponse> getNotification(UUID id);

    ApiResult<UUID> createNotification(Authentication authentication, NotificationCreateRequest apiRequest);

    ApiResult<String> updateNotification(UUID id, NotificationUpdateRequest apiRequest);

    ApiResult<String> deleteNotification(UUID id);
}
