package com.apartment.models.dtos.financial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutstandingReportResponse {
    private BigDecimal totalOutstanding;
    private Integer totalOverdueInvoices;
    private List<OutstandingDetail> outstandingDetails;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OutstandingDetail {
        private String apartmentNumber;
        private String block;
        private String ownerName;
        private String invoiceNumber;
        private Integer month;
        private Integer year;
        private BigDecimal totalAmount;
        private LocalDate dueDate;
        private Long overdueDays;
        private String status;
    }
}