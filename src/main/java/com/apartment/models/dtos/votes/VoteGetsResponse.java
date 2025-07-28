package com.apartment.models.dtos.votes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteGetsResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String voteType;
    private String status;
    private String createdByName;
    private List<VoteOptionResponse> options;
    private Integer totalVotes;
    private Boolean hasVoted; // Người dùng đã biểu quyết chưa
}
