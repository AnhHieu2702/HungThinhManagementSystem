package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.notification.NotificationCreateRequest;
import com.apartment.models.dtos.notification.NotificationGetResponse;
import com.apartment.models.global.ApiResult;

public interface INotificationSerice {
    ApiResult<List<NotificationGetResponse>> getNotificationById();

    ApiResult<UUID> createNotification(UUID userId, NotificationCreateRequest apiRequest);
}
