package com.apartment.models.dtos.feedbacks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeedbackCreateRequest {
    @NotBlank(message = "Vui lòng nhập tiêu đề")
    private String title;

    @NotBlank(message = "Vui lòng nhập nội dung phản ánh")
    private String content;

    @NotNull(message = "Vui lòng chọn căn hộ")
    private String apartmentNumber;

    private String category; // Bảo trì, Khiếu nại, Đề xuất, Khẩn cấp, Khác
}