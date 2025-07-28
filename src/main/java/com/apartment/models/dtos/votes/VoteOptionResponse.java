package com.apartment.models.dtos.votes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteOptionResponse {
    private UUID id;
    private String optionText;
    private Integer displayOrder;
    private Integer voteCount; // Số phiếu bầu cho lựa chọn này
}