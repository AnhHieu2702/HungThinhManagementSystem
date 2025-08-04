package com.apartment.models.dtos.financial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FinancialReportResponse {
    private Integer month;
    private Integer year;
    private String block;
    
    // Thu nhập
    private BigDecimal totalRevenue;
    
    // Chi phí
    private BigDecimal totalExpense;
    private BigDecimal maintenanceExpense;
    
    // Lợi nhuận
    private BigDecimal netProfit;
    
    // Công nợ
    private BigDecimal totalOutstanding;
    private Integer outstandingInvoicesCount;
    
    // Thống kê
    private Integer totalInvoices;
    private Integer paidInvoices;
    private Integer overdueInvoices;
    
    // Chi tiết theo căn hộ (nếu cần)
    private List<ApartmentFinancialDetail> apartmentDetails;
}