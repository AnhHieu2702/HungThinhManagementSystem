package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.votes.*;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IVoteService;

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
@Tag(name = "Vote Management")
public class VoteController extends ApiBaseController {
    private final IVoteService voteService;

    public VoteController(IVoteService voteService) {
        this.voteService = voteService;
    }

    @GetMapping("admin/votes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<List<VoteGetsResponse>>> getsVote() {
        return executeApiResult(() -> voteService.getsVote());
    }

    @PostMapping("admin/votes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<UUID>> createVote(@Valid @RequestBody VoteCreateRequest apiRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> voteService.createVote(apiRequest, currentUsername));
    }

    @PutMapping("admin/votes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<String>> updateVote(@PathVariable UUID id,
            @Valid @RequestBody VoteUpdateRequest apiRequest) {
        return executeApiResult(() -> voteService.updateVote(id, apiRequest));
    }

    @GetMapping("resident/votes/active")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<List<VoteGetsResponse>>> getActiveVotes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> voteService.getActiveVotes(currentUsername));
    }

    @PostMapping("resident/votes/{id}/submit")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<String>> submitVote(@PathVariable UUID id,
            @Valid @RequestBody VoteSubmitRequest apiRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return executeApiResult(() -> voteService.submitVote(id, apiRequest, currentUsername));
    }

    @GetMapping("admin/votes/{id}/result")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<VoteResultResponse>> getVoteResult(@PathVariable UUID id) {
        return executeApiResult(() -> voteService.getVoteResult(id));
    }

    @GetMapping("admin/votes/status/{voteStatus}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResult<List<VoteGetsResponse>>> getVotesByStatus(@PathVariable String voteStatus) {
        return executeApiResult(() -> voteService.getVotesByStatus(voteStatus));
    }
}