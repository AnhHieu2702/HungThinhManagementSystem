package com.apartment.models.dtos.mobilefeedbacks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MobileFeedbackCreateRequest {
    @NotBlank(message = "Vui lòng nhập tiêu đề")
    private String title;

    @NotBlank(message = "Vui lòng nhập nội dung phản ánh")
    private String content;

    @NotNull(message = "Vui lòng chọn căn hộ")
    private String apartmentNumber;

    @NotBlank(message = "Vui lòng chọn loại phản ánh")
    private String category; // Bảo trì, Khiếu nại, Đề xuất, Khẩn cấp, Khác

    // Các trường dành riêng cho yêu cầu sửa chữa thiết bị
    private String deviceCode; // Mã thiết bị (nếu biết)
    private String deviceLocation; // Vị trí thiết bị
    private String priority; // Thấp, Trung bình, Cao, Khẩn cấp (chỉ cho Bảo trì)
    private String issueType; // Hỏng hóc, Bảo trì định kỳ, Cải thiện (chỉ cho Bảo trì)
}