package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackCreateRequest;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackResponse;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackSummaryResponse;
import com.apartment.models.global.ApiResult;

public interface IMobileFeedbackService {
    ApiResult<UUID> createFeedback(MobileFeedbackCreateRequest apiRequest, String currentUsername);
    
    ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacks(String currentUsername);
    
    ApiResult<MobileFeedbackResponse> getFeedbackById(UUID feedbackId, String currentUsername);

    ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacksWithFilter(
        String currentUsername, String status, String category);
}