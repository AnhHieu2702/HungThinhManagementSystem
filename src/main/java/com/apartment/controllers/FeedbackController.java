package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.feedbacks.FeedbackAssignRequest;
import com.apartment.models.dtos.feedbacks.FeedbackCreateRequest;
import com.apartment.models.dtos.feedbacks.FeedbackGetsResponse;
import com.apartment.models.dtos.feedbacks.FeedbackUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IFeedbackService;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api")
@Tag(name = "Feedback Management")
public class FeedbackController extends ApiBaseController {
    private final IFeedbackService feedbackService;

    public FeedbackController(IFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("admin/feedbacks")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('ACCOUNTANT') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<FeedbackGetsResponse>>> getsFeedback() {
        return executeApiResult(() -> feedbackService.getsFeedback());
    }

    @PostMapping("resident/feedbacks")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<UUID>> createFeedback(@Valid @RequestBody FeedbackCreateRequest apiRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        return executeApiResult(() -> feedbackService.createFeedback(apiRequest, currentUsername));
    }

    @PutMapping("admin-technician-accountant/feedbacks/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('TECHNICIAN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<String>> updateFeedback(@PathVariable UUID id, 
                                                           @Valid @RequestBody FeedbackUpdateRequest apiRequest) {
        return executeApiResult(() -> feedbackService.updateFeedback(id, apiRequest));
    }

    @PutMapping("admin/feedbacks/{id}/assign")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResult<String>> assignFeedback(@PathVariable UUID id, 
                                                           @Valid @RequestBody FeedbackAssignRequest apiRequest) {
        return executeApiResult(() -> feedbackService.assignFeedback(id, apiRequest));
    }

    @GetMapping("admin-technician-accountant/feedbacks/status/{feedbackStatus}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT') or hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResult<List<FeedbackGetsResponse>>> getFeedbacksByStatus(@PathVariable String feedbackStatus) {
        return executeApiResult(() -> feedbackService.getFeedbacksByStatus(feedbackStatus));
    }
}