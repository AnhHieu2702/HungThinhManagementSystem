package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.votes.VoteCreateRequest;
import com.apartment.models.dtos.votes.VoteGetsResponse;
import com.apartment.models.dtos.votes.VoteResultResponse;
import com.apartment.models.dtos.votes.VoteSubmitRequest;
import com.apartment.models.dtos.votes.VoteUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IVoteService {
    ApiResult<List<VoteGetsResponse>> getsVote();
    
    ApiResult<UUID> createVote(VoteCreateRequest apiRequest, String currentUsername);
    
    ApiResult<String> updateVote(UUID voteId, VoteUpdateRequest apiRequest);
    
    ApiResult<List<VoteGetsResponse>> getActiveVotes(String currentUsername);
    
    ApiResult<String> submitVote(UUID voteId, VoteSubmitRequest apiRequest, String currentUsername);
    
    ApiResult<VoteResultResponse> getVoteResult(UUID voteId);
    
    ApiResult<List<VoteGetsResponse>> getVotesByStatus(String status);
}