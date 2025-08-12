package com.apartment.models.dtos.invoices;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class InvoiceCreateRequest {
    @NotNull(message = "Vui lòng chọn căn hộ")
    private String apartmentNumber;

    @NotNull(message = "Vui lòng chọn tháng")
    private Integer month;

    @NotNull(message = "Vui lòng chọn năm")
    private Integer year;

    @Positive(message = "Phí quản lý phải lớn hơn 0")
    @Builder.Default
    private BigDecimal managementFee = BigDecimal.ZERO;

    @Positive(message = "Phí nước phải lớn hơn 0")
    @Builder.Default
    private BigDecimal waterFee = BigDecimal.ZERO;

    @Positive(message = "Phí điện phải lớn hơn 0")
    @Builder.Default
    private BigDecimal electricityFee = BigDecimal.ZERO;

    @Positive(message = "Phí gửi xe phải lớn hơn 0")
    @Builder.Default
    private BigDecimal parkingFee = BigDecimal.ZERO;

    @Positive(message = "Phí khác phải lớn hơn 0")
    @Builder.Default
    private BigDecimal otherFee = BigDecimal.ZERO;

    private LocalDate dueDate;
}