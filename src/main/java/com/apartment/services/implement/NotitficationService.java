package com.apartment.services.implement;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.apartment.models.dtos.notification.NotificationCreateRequest;
import com.apartment.models.dtos.notification.NotificationGetResponse;
import com.apartment.models.dtos.notification.NotificationGetsResponse;
import com.apartment.models.dtos.notification.NotificationUpdateRequest;
import com.apartment.models.entities.bases.Notification;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.TargetType;
import com.apartment.models.global.ApiResult;
import com.apartment.models.security.UserPrincipal;
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
    public ApiResult<List<NotificationGetsResponse>> getsNotification() {
        List<Notification> notifications = notificationRepository.findByTargetType(TargetType.ALL);

        List<NotificationGetsResponse> responseList = notifications.stream()
                .<NotificationGetsResponse>map(notification -> {
                    String timeAgo = getTimeAgo(notification.getSendTime());
                    String shortContent = shortenContent(notification.getContent(), 100);

                    return NotificationGetsResponse.builder()
                            .id(notification.getId())
                            .title(notification.getTitle())
                            .content(shortContent)
                            .senderName(notification.getSender().getRole().getDisplayName())
                            .sendTime(timeAgo) // trả về dạng "X giờ Y phút trước"
                            .priority(notification.getPriority().getDisplayName())
                            .build();
                })
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thông báo thành công");
    }

    @Override
    public ApiResult<NotificationGetResponse> getNotification(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với ID: " + id));

        String timeAgo = getTimeAgo(notification.getSendTime());

        NotificationGetResponse response = NotificationGetResponse.builder()
                .title(notification.getTitle())
                .content(notification.getContent())
                .senderName(notification.getSender().getRole().getDisplayName())
                .priority(notification.getPriority().getDisplayName())
                .sendTime(timeAgo)
                .build();

        return ApiResult.success(response, "Lấy thông báo thành công");
    }

    @Override
    public ApiResult<UUID> createNotification(Authentication authentication, NotificationCreateRequest apiRequest) {
        UUID userId = getUserIdFromAuthentication(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

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

    @Override
    public ApiResult<String> updateNotification(UUID id, NotificationUpdateRequest apiRequest) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với ID: " + id));

        notification.setTitle(apiRequest.getTitle());
        notification.setContent(apiRequest.getContent());
        notification.setTargetType(apiRequest.getTargetType());
        notification.setPriority(apiRequest.getPriority());

        notificationRepository.save(notification);

        return ApiResult.success(null, "Thông báo đã được cập nhật");
    }

    @Override
    public ApiResult<String> deleteNotification(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với ID: " + id));

        notificationRepository.delete(notification);

        return ApiResult.success(null , "Thông báo đã được xóa");
    }

    private UUID getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Không xác định được người dùng");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getId();
        }
        throw new RuntimeException("Principal không chứa thông tin userId");
    }

    private String getTimeAgo(LocalDateTime sendTime) {
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(sendTime, now);

        long seconds = duration.getSeconds();
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;
        long weeks = days / 7;
        long months = days / 30; // ước lượng tháng 30 ngày
        long years = days / 365; // ước lượng năm 365 ngày

        if (seconds < 60) {
            return "Vừa xong";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else if (hours < 24) {
            return hours + " giờ trước";
        } else if (days < 7) {
            return days + " ngày trước";
        } else if (weeks < 4) {
            return weeks + " tuần trước";
        } else if (months < 12) {
            return months + " tháng trước";
        } else {
            return years + " năm trước";
        }
    }

    private String shortenContent(String content, int maxLength) {
        if (content == null)
            return "";
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}
