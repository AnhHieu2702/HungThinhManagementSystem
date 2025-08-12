package com.apartment.models.dtos.financial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApartmentFinancialDetail {
    private String apartmentNumber;
    private String block;
    private Integer floor;
    private String ownerName;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private String status;
    private Integer overdueInvoicesCount;
}