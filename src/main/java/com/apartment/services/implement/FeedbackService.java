package com.apartment.services.implement;

import java.util.List;
import java.util.UUID;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.feedbacks.FeedbackAssignRequest;
import com.apartment.models.dtos.feedbacks.FeedbackCreateRequest;
import com.apartment.models.dtos.feedbacks.FeedbackGetsResponse;
import com.apartment.models.dtos.feedbacks.FeedbackUpdateRequest;
import com.apartment.models.entities.bases.Apartment;
import com.apartment.models.entities.bases.Feedback;
import com.apartment.models.entities.bases.User;
import com.apartment.models.entities.enums.FeedbackStatus;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.ApartmentRepository;
import com.apartment.repositories.FeedbackRepository;
import com.apartment.repositories.UserRepository;
import com.apartment.services.interfaces.IFeedbackService;

import org.springframework.stereotype.Service;

@Service
public class FeedbackService implements IFeedbackService {
        private final FeedbackRepository feedbackRepository;
        private final UserRepository userRepository;
        private final ApartmentRepository apartmentRepository;

        public FeedbackService(FeedbackRepository feedbackRepository,
                        UserRepository userRepository,
                        ApartmentRepository apartmentRepository) {
                this.feedbackRepository = feedbackRepository;
                this.userRepository = userRepository;
                this.apartmentRepository = apartmentRepository;
        }

        @Override
        public ApiResult<List<FeedbackGetsResponse>> getsFeedback() {
                List<Feedback> feedbacks = feedbackRepository.findAll(); // Thay đổi từ findAllByOrderByCreatedAtDesc()
                                                                         // thành findAll()
                List<FeedbackGetsResponse> responseList = feedbacks.stream()
                                .map(this::mapToFeedbackResponse)
                                .toList();

                return ApiResult.success(responseList, "Lấy danh sách phản ánh thành công");
        }

        @Override
        public ApiResult<UUID> createFeedback(FeedbackCreateRequest apiRequest, UUID residentId) {
                User resident = userRepository.findById(residentId)
                                .orElseThrow(() -> new UserMessageException("Cư dân không tồn tại"));

                Apartment apartment = apartmentRepository.findByApartmentNumber(apiRequest.getApartmentNumber())
                                .orElseThrow(() -> new UserMessageException("Căn hộ không tồn tại"));

                Feedback newFeedback = new Feedback();
                newFeedback.setTitle(apiRequest.getTitle());
                newFeedback.setContent(apiRequest.getContent());
                newFeedback.setResident(resident);
                newFeedback.setApartment(apartment);
                newFeedback.setCategory(apiRequest.getCategory());
                newFeedback.setStatus(FeedbackStatus.PENDING);

                feedbackRepository.save(newFeedback);

                return ApiResult.success(newFeedback.getId(), "Tạo phản ánh thành công");
        }

        @Override
        public ApiResult<String> updateFeedback(UUID feedbackId, FeedbackUpdateRequest apiRequest) {
                Feedback feedback = feedbackRepository.findById(feedbackId)
                                .orElseThrow(() -> new UserMessageException("Phản ánh không tồn tại"));

                feedback.setResponse(apiRequest.getResponse());
                feedback.setStatus(FeedbackStatus.valueOf(apiRequest.getStatus()));

                if (apiRequest.getAssignedTo() != null) {
                        User assignedUser = userRepository.findById(apiRequest.getAssignedTo())
                                        .orElseThrow(() -> new UserMessageException(
                                                        "Người được phân công không tồn tại"));
                        feedback.setAssignedTo(assignedUser);
                }

                feedbackRepository.save(feedback);

                return ApiResult.success(null, "Cập nhật phản ánh thành công");
        }

        @Override
        public ApiResult<String> assignFeedback(UUID feedbackId, FeedbackAssignRequest apiRequest) {
                Feedback feedback = feedbackRepository.findById(feedbackId)
                                .orElseThrow(() -> new UserMessageException("Phản ánh không tồn tại"));

                User assignedUser = userRepository.findById(apiRequest.getAssignedTo())
                                .orElseThrow(() -> new UserMessageException("Người được phân công không tồn tại"));

                feedback.setAssignedTo(assignedUser);
                feedback.setStatus(FeedbackStatus.IN_PROGRESS);
                feedbackRepository.save(feedback);

                return ApiResult.success(null, "Phân công xử lý phản ánh thành công");
        }

        @Override
        public ApiResult<List<FeedbackGetsResponse>> getFeedbacksByStatus(String status) {
                FeedbackStatus feedbackStatus = FeedbackStatus.valueOf(status);
                List<Feedback> feedbacks = feedbackRepository.findByStatus(feedbackStatus);
                List<FeedbackGetsResponse> responseList = feedbacks.stream()
                                .map(this::mapToFeedbackResponse)
                                .toList();

                return ApiResult.success(responseList, "Lấy danh sách phản ánh theo trạng thái thành công");
        }

        private FeedbackGetsResponse mapToFeedbackResponse(Feedback feedback) {
                return new FeedbackGetsResponse(
                                feedback.getId(),
                                feedback.getTitle(),
                                feedback.getContent(),
                                feedback.getResident().getUsername(),
                                feedback.getApartment().getApartmentNumber(),
                                feedback.getCategory(),
                                feedback.getStatus().getDisplayName(),
                                feedback.getResponse(),
                                feedback.getAssignedTo() != null ? feedback.getAssignedTo().getUsername() : null);
        }
}