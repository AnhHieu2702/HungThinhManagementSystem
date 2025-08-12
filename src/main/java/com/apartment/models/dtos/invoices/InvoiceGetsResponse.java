package com.apartment.models.dtos.invoices;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceGetsResponse {
    private UUID id;
    private String invoiceNumber;
    private String apartmentNumber;
    private String ownerName;
    private Integer month;
    private Integer year;
    private BigDecimal managementFee;
    private BigDecimal waterFee;
    private BigDecimal electricityFee;
    private BigDecimal parkingFee;
    private BigDecimal otherFee;
    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private String status;
}