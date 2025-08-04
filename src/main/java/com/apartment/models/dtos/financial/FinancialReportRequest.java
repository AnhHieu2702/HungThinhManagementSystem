package com.apartment.models.dtos.financial;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FinancialReportRequest {
    @NotNull(message = "Vui lòng chọn tháng")
    @Min(value = 1, message = "Tháng phải từ 1 đến 12")
    @Max(value = 12, message = "Tháng phải từ 1 đến 12")
    private Integer month;

    @NotNull(message = "Vui lòng chọn năm")
    @Min(value = 2020, message = "Năm phải từ 2020 trở lên")
    private Integer year;

    private String block; // Tùy chọn lọc theo block
}