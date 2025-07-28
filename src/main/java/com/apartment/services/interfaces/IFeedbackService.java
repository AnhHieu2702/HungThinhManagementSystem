package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.feedbacks.FeedbackAssignRequest;
import com.apartment.models.dtos.feedbacks.FeedbackCreateRequest;
import com.apartment.models.dtos.feedbacks.FeedbackGetsResponse;
import com.apartment.models.dtos.feedbacks.FeedbackUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IFeedbackService {
    ApiResult<List<FeedbackGetsResponse>> getsFeedback();
    
    ApiResult<UUID> createFeedback(FeedbackCreateRequest apiRequest, String currentUsername);
    
    ApiResult<String> updateFeedback(UUID feedbackId, FeedbackUpdateRequest apiRequest);
    
    ApiResult<String> assignFeedback(UUID feedbackId, FeedbackAssignRequest apiRequest);
    
    ApiResult<List<FeedbackGetsResponse>> getFeedbacksByStatus(String status);
}