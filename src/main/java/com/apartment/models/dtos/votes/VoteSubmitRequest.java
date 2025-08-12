package com.apartment.models.dtos.votes;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VoteSubmitRequest {
    @NotNull(message = "Vui lòng chọn căn hộ")
    private String apartmentNumber;

    private String selectedOptionText; // ← THÊM MỚI - Chọn bằng text

    private String voteValue; // Cho YES_NO (YES/NO) hoặc comment

    private String comment; // Ý kiến bổ sung
}