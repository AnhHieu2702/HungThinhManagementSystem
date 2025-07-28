package com.apartment.models.dtos.votes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteCommentResponse {
    private String voterName;
    private String apartmentNumber;
    private String comment;
    private LocalDateTime createdAt;
}