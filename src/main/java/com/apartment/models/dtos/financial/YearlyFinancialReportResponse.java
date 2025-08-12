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
public class YearlyFinancialReportResponse {
    private Integer year;
    private String block;
    
    // Tổng quan cả năm
    private BigDecimal totalYearRevenue;
    private BigDecimal totalYearExpense;
    private BigDecimal totalYearProfit;
    private BigDecimal totalYearOutstanding;
    
    // Thống kê cả năm
    private Integer totalYearInvoices;
    private Integer totalYearPaidInvoices;
    private Integer totalYearOverdueInvoices;
    private BigDecimal yearCollectionRate;
    
    // Chi tiết từng tháng
    private List<MonthlyFinancialSummary> monthlyDetails;
    
    // Phân tích xu hướng
    private String bestMonth; // Tháng thu cao nhất
    private String worstMonth; // Tháng thu thấp nhất
    private BigDecimal averageMonthlyRevenue;
    private BigDecimal averageMonthlyExpense;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyFinancialSummary {
        private Integer month;
        private String monthName;
        private BigDecimal revenue;
        private BigDecimal expense;
        private BigDecimal profit;
        private BigDecimal outstanding;
        private Integer totalInvoices;
        private Integer paidInvoices;
        private Integer overdueInvoices;
    }
}