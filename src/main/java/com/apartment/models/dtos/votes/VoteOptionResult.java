package com.apartment.models.dtos.votes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteOptionResult {
    private String optionText;
    private Integer voteCount;
    private Double percentage;
}