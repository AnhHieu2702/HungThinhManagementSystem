package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackCreateRequest;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackResponse;
import com.apartment.models.dtos.mobilefeedbacks.MobileFeedbackSummaryResponse;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IMobileFeedbackService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/mobile")
@Tag(name = "Mobile Feedback Management")
@PreAuthorize("hasRole('RESIDENT')")
public class MobileFeedbackController extends ApiBaseController {
    private final IMobileFeedbackService mobileFeedbackService;

    public MobileFeedbackController(IMobileFeedbackService mobileFeedbackService) {
        this.mobileFeedbackService = mobileFeedbackService;
    }

    @PostMapping("/feedbacks")
    public ResponseEntity<ApiResult<UUID>> createFeedback(@Valid @RequestBody MobileFeedbackCreateRequest apiRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> mobileFeedbackService.createFeedback(apiRequest, currentUsername));
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<ApiResult<List<MobileFeedbackSummaryResponse>>> getMyFeedbacks() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> mobileFeedbackService.getMyFeedbacks(currentUsername));
    }

    @GetMapping("/feedbacks/{feedbackId}")
    public ResponseEntity<ApiResult<MobileFeedbackResponse>> getFeedbackById(@PathVariable UUID feedbackId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> mobileFeedbackService.getFeedbackById(feedbackId, currentUsername));
    }

    @GetMapping("/feedbacks/filter")
    public ResponseEntity<ApiResult<List<MobileFeedbackSummaryResponse>>> getMyFeedbacksWithFilter(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> mobileFeedbackService.getMyFeedbacksWithFilter(currentUsername, status, category));
    }
}