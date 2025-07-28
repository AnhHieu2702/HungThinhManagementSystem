package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackCreateRequest;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackResponse;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackSummaryResponse;
import com.apartment.models.global.ApiResult;

public interface IMobileFeedbackService {
    // Tạo phản ánh/yêu cầu sửa chữa
    ApiResult<UUID> createFeedback(MobileFeedbackCreateRequest apiRequest, String currentUsername);
    
    // Lấy danh sách phản ánh của cư dân (tóm tắt)
    ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacks(String currentUsername);
    
    // Lấy chi tiết một phản ánh
    ApiResult<MobileFeedbackResponse> getFeedbackById(UUID feedbackId, String currentUsername);
    
    // Lấy phản ánh theo trạng thái
    ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacksByStatus(String status, String currentUsername);
    
    // Lấy phản ánh theo loại
    ApiResult<List<MobileFeedbackSummaryResponse>> getMyFeedbacksByCategory(String category, String currentUsername);
    
    // Lấy phản ánh khẩn cấp
    ApiResult<List<MobileFeedbackSummaryResponse>> getMyUrgentFeedbacks(String currentUsername);
    
    // Thống kê phản ánh của cư dân
    ApiResult<Long> countPendingResponseFeedbacks(String currentUsername);
}