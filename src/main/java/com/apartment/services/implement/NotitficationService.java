package com.apartment.services.implement;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.apartment.models.dtos.notification.NotificationCreateRequest;
import com.apartment.models.dtos.notification.NotificationGetResponse;
import com.apartment.models.entities.bases.Notification;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.TargetType;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.NotificationRepository;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.INotificationSerice;

@Service
public class NotitficationService implements INotificationSerice {
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public NotitficationService(UserRepository userRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }
    
    @Override
    public ApiResult<List<NotificationGetResponse>> getNotificationById() {
        List<Notification> notifications = notificationRepository.findByTargetType(TargetType.ALL);

        List<NotificationGetResponse> responseList = notifications.stream()
                .<NotificationGetResponse>map(notification -> NotificationGetResponse.builder()
                        .title(notification.getTitle())
                        .content(notification.getContent())
                        .senderName(notification.getSender().getUsername())
                        .sendTime(notification.getSendTime())
                        .priority(notification.getPriority().getDisplayName())
                        .build())
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thông báo thành công");
    }

    @Override
    public ApiResult<UUID> createNotification(UUID userId, NotificationCreateRequest apiRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        Notification notification = Notification.builder()
                .title(apiRequest.getTitle())
                .content(apiRequest.getContent())
                .sender(user)
                .targetType(apiRequest.getTargetType())
                .targetValue(apiRequest.getTargetValue())
                .priority(apiRequest.getPriority())
                .build();
        notification = notificationRepository.save(notification);

        return ApiResult.success(notification.getId(), "Tạo thông báo thành công");
    }

}
