package com.apartment.models.dtos.votes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VoteCreateRequest {
    @NotBlank(message = "Vui lòng nhập tiêu đề cuộc biểu quyết")
    private String title;

    @NotBlank(message = "Vui lòng nhập mô tả cuộc biểu quyết")
    private String description;

    @NotNull(message = "Vui lòng chọn thời gian bắt đầu")
    private LocalDateTime startDate;

    @NotNull(message = "Vui lòng chọn thời gian kết thúc")
    private LocalDateTime endDate;

    @NotBlank(message = "Vui lòng chọn loại biểu quyết")
    private String voteType; // YES_NO, MULTIPLE_CHOICE, SINGLE_CHOICE

    private List<String> options; // Danh sách lựa chọn (cho MULTIPLE_CHOICE, SINGLE_CHOICE)

    private String status;
    
}