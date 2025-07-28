package com.apartment.models.dtos.votes;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class VoteSubmitRequest {
    @NotNull(message = "Vui lòng chọn căn hộ")
    private String apartmentNumber;

    private UUID selectedOptionId; // Cho MULTIPLE_CHOICE, SINGLE_CHOICE

    private String voteValue; // Cho YES_NO (YES/NO) hoặc comment

    private String comment; // Ý kiến bổ sung
}