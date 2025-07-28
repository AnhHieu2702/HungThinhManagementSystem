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

            Apartment apartment = apartmentRepository.findByApartmentNumber(apiRequest.getApartmentNumber())
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

            List<Feedback> feedbacks = mobileFeedbackRepository.findByResidentId(resident.getId());
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
        public ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacksByStatus(String status,
                String currentUsername) {
            User resident = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            FeedbackStatus feedbackStatus = FeedbackStatus.valueOf(status);
            List<Feedback> feedbacks = mobileFeedbackRepository.findByResidentIdAndStatus(resident.getId(), feedbackStatus);
            List<MobileFeedbackSummaryResponse> responseList = feedbacks.stream()
                    .map(this::mapToSummaryResponse)
                    .toList();

            return ApiResult.success(responseList, "Lấy danh sách phản ánh theo trạng thái thành công");
        }

        @Override
        public ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacksByCategory(String category,
                String currentUsername) {
            User resident = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            List<Feedback> feedbacks = mobileFeedbackRepository.findByResidentIdAndCategory(resident.getId(), category);
            List<MobileFeedbackSummaryResponse> responseList = feedbacks.stream()
                    .map(this::mapToSummaryResponse)
                    .toList();

            return ApiResult.success(responseList, "Lấy danh sách phản ánh theo loại thành công");
        }

        @Override
        public ApiResult<List<MobileFeedbackSummaryResponse>> getMyUrgentFeedbacks(String currentUsername) {
            User resident = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            List<Feedback> feedbacks = mobileFeedbackRepository.findByResidentIdAndCategory(resident.getId(), "Khẩn cấp");
            List<MobileFeedbackSummaryResponse> responseList = feedbacks.stream()
                    .map(this::mapToSummaryResponse)
                    .toList();

            return ApiResult.success(responseList, "Lấy danh sách phản ánh khẩn cấp thành công");
        }

        @Override
        public ApiResult<Long> countPendingResponseFeedbacks(String currentUsername) {
            User resident = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserMessageException("Người dùng không tồn tại"));

            long count = mobileFeedbackRepository.countByResidentIdAndResponseIsNull(resident.getId());
            return ApiResult.success(count, "Đếm số phản ánh chưa có phản hồi thành công");
        }

        // Helper methods
        private void validateFeedbackRequest(MobileFeedbackCreateRequest request) {
            if ("Bảo trì".equals(request.getCategory())) {
                // Validation cho yêu cầu bảo trì
                if (request.getPriority() == null || request.getPriority().trim().isEmpty()) {
                    throw new UserMessageException("Vui lòng chọn mức độ ưu tiên cho yêu cầu bảo trì");
                }
                if (request.getIssueType() == null || request.getIssueType().trim().isEmpty()) {
                    throw new UserMessageException("Vui lòng chọn loại vấn đề cho yêu cầu bảo trì");
                }
            }

            // Bỏ phần kiểm tra device code vì không cần thiết
            // Cư dân có thể nhập deviceCode tự do mà không cần validate với database
        }

        private String buildDetailedContent(MobileFeedbackCreateRequest request) {
            StringBuilder content = new StringBuilder();
            content.append("Nội dung: ").append(request.getContent()).append("\n");

            if ("Bảo trì".equals(request.getCategory())) {
                // Thông tin bổ sung cho yêu cầu bảo trì
                content.append("Loại vấn đề: ").append(request.getIssueType()).append("\n");
                content.append("Mức độ ưu tiên: ").append(request.getPriority()).append("\n");

                if (request.getDeviceCode() != null && !request.getDeviceCode().trim().isEmpty()) {
                    content.append("Mã thiết bị: ").append(request.getDeviceCode()).append("\n");
                }

                if (request.getDeviceLocation() != null && !request.getDeviceLocation().trim().isEmpty()) {
                    content.append("Vị trí thiết bị: ").append(request.getDeviceLocation()).append("\n");
                }
            }

            return content.toString();
        }

        private String getSuccessMessage(String category) {
            return switch (category) {
                case "Bảo trì" -> "Gửi yêu cầu sửa chữa thiết bị thành công";
                case "Khiếu nại" -> "Gửi khiếu nại thành công";
                case "Đề xuất" -> "Gửi đề xuất thành công";
                case "Khẩn cấp" -> "Gửi báo cáo khẩn cấp thành công";
                default -> "Gửi phản ánh thành công";
            };
        }

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