package com.apartment.models.dtos.invoices;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class InvoiceBulkCreateRequest {
    @NotNull(message = "Vui lòng chọn tháng")
    private Integer month;

    @NotNull(message = "Vui lòng chọn năm")
    private Integer year;

    @Builder.Default
    private BigDecimal managementFee = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal waterFee = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal electricityFee = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal parkingFee = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal otherFee = BigDecimal.ZERO;
    
    private LocalDate dueDate;
}