package com.apartment.models.dtos.votes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteResultResponse {
    private UUID voteId;
    private String title;
    private String status;
    private Integer totalParticipants;
    private List<VoteOptionResult> results;
    private List<VoteCommentResponse> comments;
}