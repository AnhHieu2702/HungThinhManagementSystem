package com.apartment.services.implement;

import java.util.List;
import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackCreateRequest;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackResponse;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackSummaryResponse;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.entities.bases.Feedback;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.FeedbackStatus;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.MobileFeedbackRepository;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.IMobileFeedbackService;

import org.springframework.stereotype.Service;

@Service
public class MobileFeedbackService implements IMobileFeedbackService {
    private final MobileFeedbackRepository mobileFeedbackRepository;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;

    public MobileFeedbackService(MobileFeedbackRepository mobileFeedbackRepository,
            UserRepository userRepository,
            ApartmentRepository apartmentRepository) {
        this.mobileFeedbackRepository = mobileFeedbackRepository;
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    public ApiResult<UUID> createFeedback(MobileFeedbackCreateRequest apiRequest, String currentUsername) {
        User resident = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        Apartment apartment = apartmentRepository.findByOwnerId(resident.getId())
                .orElseThrow(() -> new UserMessageException("Căn hộ không tồn tại"));
        validateFeedbackRequest(apiRequest);

        String detailedContent = buildDetailedContent(apiRequest);

        Feedback feedback = new Feedback();
        feedback.setTitle(apiRequest.getTitle());
        feedback.setContent(detailedContent);
        feedback.setResident(resident);
        feedback.setApartment(apartment);
        feedback.setCategory(apiRequest.getCategory());
        feedback.setStatus(FeedbackStatus.PENDING);

        mobileFeedbackRepository.save(feedback);

        String successMessage = getSuccessMessage(apiRequest.getCategory());
        return ApiResult.success(feedback.getId(), successMessage);
    }

    @Override
    public ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacks(String currentUsername) {
        User resident = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        List<Feedback> feedbacks = mobileFeedbackRepository.findByResidentIdOrderByIdDesc(resident.getId());
        List<MobileFeedbackSummaryResponse> responseList = feedbacks.stream()
                .map(this::mapToSummaryResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách phản ánh thành công");
    }

    @Override
    public ApiResult<MobileFeedbackResponse> getFeedbackById(UUID feedbackId, String currentUsername) {
        User resident = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        Feedback feedback = mobileFeedbackRepository.findByIdAndResidentId(feedbackId, resident.getId());
        if (feedback == null) {
            throw new UserMessageException("Không tìm thấy phản ánh hoặc bạn không có quyền truy cập");
        }

        MobileFeedbackResponse response = mapToDetailResponse(feedback);
        return ApiResult.success(response, "Lấy thông tin phản ánh thành công");
    }

    @Override
    public ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacksWithFilter(
            String currentUsername, String status, String category) {

        User resident = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

        // Convert status string to enum if provided
        FeedbackStatus feedbackStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                feedbackStatus = FeedbackStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new UserMessageException("Trạng thái không hợp lệ: " + status);
            }
        }

        // Use appropriate repository method based on filter parameters
        List<Feedback> feedbacks = getFilteredFeedbacks(resident.getId(), feedbackStatus, category);

        List<MobileFeedbackSummaryResponse> responseList = feedbacks.stream()
                .map(this::mapToSummaryResponse)
                .toList();

        String successMessage = buildFilterSuccessMessage(status, category);
        return ApiResult.success(responseList, successMessage);
    }

    private List<Feedback> getFilteredFeedbacks(UUID residentId, FeedbackStatus status, String category) {
        // Both status and category provided
        if (status != null && category != null) {
            return mobileFeedbackRepository.findByResidentIdAndStatusAndCategoryOrderByIdDesc(
                    residentId, status, category);
        }

        // Only status provided
        if (status != null) {
            return mobileFeedbackRepository.findByResidentIdAndStatusOrderByIdDesc(
                    residentId, status);
        }

        // Only category provided
        if (category != null) {
            return mobileFeedbackRepository.findByResidentIdAndCategoryOrderByIdDesc(
                    residentId, category);
        }

        // No filters - return all feedbacks
        return mobileFeedbackRepository.findByResidentIdOrderByIdDesc(residentId);
    }

    private String buildFilterSuccessMessage(String status, String category) {
        if (status != null && category != null) {
            return "Lấy danh sách phản ánh theo trạng thái và loại thành công";
        }
        if (status != null) {
            return "Lấy danh sách phản ánh theo trạng thái thành công";
        }
        if (category != null) {
            return "Lấy danh sách phản ánh theo loại thành công";
        }
        return "Lấy danh sách phản ánh với filter thành công";
    }

    // Validation helper methods (unchanged)
    private void validateFeedbackRequest(MobileFeedbackCreateRequest request) {
        if ("Bảo trì".equals(request.getCategory())) {
            if (request.getPriority() == null || request.getPriority().trim().isEmpty()) {
                throw new UserMessageException("Vui lòng chọn mức độ ưu tiên cho yêu cầu bảo trì");
            }
            if (request.getIssueType() == null || request.getIssueType().trim().isEmpty()) {
                throw new UserMessageException("Vui lòng chọn loại vấn đề cho yêu cầu bảo trì");
            }
        }
    }

    // SỬA: Chỉ lấy đúng mô tả chi tiết người dùng nhập, không nối thêm thông tin gì!
    private String buildDetailedContent(MobileFeedbackCreateRequest request) {
        return request.getContent();
    }

    private String getSuccessMessage(String category) {
        return switch (category) {
            case "Bảo trì" -> "Gửi phản ánh bảo trì thành công";
            case "Khiếu nại" -> "Gửi phản ánh khiếu nại thành công";
            case "Đề xuất" -> "Gửi phản ánh đề xuất thành công";
            case "Khẩn cấp" -> "Gửi phản ánh khẩn cấp thành công";
            default -> "Gửi phản ánh thành công";
        };
    }

    // Mapping helper methods (unchanged)
    private MobileFeedbackSummaryResponse mapToSummaryResponse(Feedback feedback) {
        return new MobileFeedbackSummaryResponse(
                feedback.getId(),
                feedback.getTitle(),
                feedback.getCategory(),
                feedback.getStatus().getDisplayName(),
                feedback.getResponse() != null && !feedback.getResponse().trim().isEmpty());
    }

    private MobileFeedbackResponse mapToDetailResponse(Feedback feedback) {
        String[] contentLines = feedback.getContent().split("\n");
        String originalContent = extractValueFromContent(contentLines, "Nội dung:");
        String deviceCode = extractValueFromContent(contentLines, "Mã thiết bị:");
        String deviceLocation = extractValueFromContent(contentLines, "Vị trí thiết bị:");
        String priority = extractValueFromContent(contentLines, "Mức độ ưu tiên:");
        String issueType = extractValueFromContent(contentLines, "Loại vấn đề:");

        return new MobileFeedbackResponse(
                feedback.getId(),
                feedback.getTitle(),
                originalContent,
                feedback.getApartment().getApartmentNumber(),
                feedback.getCategory(),
                feedback.getStatus().getDisplayName(),
                feedback.getResponse() != null ? feedback.getResponse() : "",
                deviceCode,
                deviceLocation,
                priority,
                issueType);
    }

    private String extractValueFromContent(String[] lines, String key) {
        for (String line : lines) {
            if (line.startsWith(key)) {
                return line.substring(key.length()).trim();
            }
        }
        return "";
    }
}