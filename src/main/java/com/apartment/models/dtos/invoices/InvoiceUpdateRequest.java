package com.apartment.models.dtos.invoices;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceUpdateRequest {
    private BigDecimal managementFee;
    private BigDecimal waterFee;
    private BigDecimal electricityFee;
    private BigDecimal parkingFee;
    private BigDecimal otherFee;
    private LocalDate dueDate;
    private String status;
}