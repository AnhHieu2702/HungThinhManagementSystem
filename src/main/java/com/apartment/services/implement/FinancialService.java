package com.apartment.services.implement;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.apartment.models.dtos.financial.ApartmentFinancialDetail;
import com.apartment.models.dtos.financial.FinancialReportRequest;
import com.apartment.models.dtos.financial.FinancialReportResponse;
import com.apartment.models.dtos.financial.OutstandingReportResponse;
import com.apartment.models.dtos.financial.YearlyFinancialReportResponse;
import com.apartment.models.entities.bases.Invoice;
import com.apartment.models.entities.bases.Maintenance;
import com.apartment.models.entities.bases.Payment;
import com.apartment.models.entities.enums.InvoiceStatus;
import com.apartment.models.entities.enums.MaintenanceStatus;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.FinancialRepository;
import com.apartment.repositories.MaintenanceRepository;
import com.apartment.repositories.PaymentRepository;
import com.apartment.services.interfaces.IFinancialService;

@Service
public class FinancialService implements IFinancialService {
    
    private final FinancialRepository financialRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final PaymentRepository paymentRepository;
    
    private static final String[] MONTH_NAMES = {
        "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    };
    
    public FinancialService(FinancialRepository financialRepository,
                          MaintenanceRepository maintenanceRepository,
                          PaymentRepository paymentRepository) {
        this.financialRepository = financialRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    public ApiResult<FinancialReportResponse> generateFinancialReport(FinancialReportRequest request) {
        List<Invoice> invoices;
        if (request.getBlock() != null && !request.getBlock().isEmpty()) {
            invoices = financialRepository.findByMonthAndYearAndApartmentBlock(
                request.getMonth(), request.getYear(), request.getBlock());
        } else {
            invoices = financialRepository.findByMonthAndYear(
                request.getMonth(), request.getYear());
        }
        
        List<Payment> payments;
        if (request.getBlock() != null && !request.getBlock().isEmpty()) {
            payments = paymentRepository.findByInvoiceMonthAndInvoiceYearAndInvoiceApartmentBlock(
                request.getMonth(), request.getYear(), request.getBlock());
        } else {
            payments = paymentRepository.findByInvoiceMonthAndInvoiceYear(
                request.getMonth(), request.getYear());
        }
        
        BigDecimal totalRevenue = payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<Invoice> paidInvoices = invoices.stream()
            .filter(i -> i.getStatus() == InvoiceStatus.PAID)
            .collect(Collectors.toList());
            
        // Tính các loại phí từ hóa đơn đã thanh toán
        BigDecimal managementFee = paidInvoices.stream()
            .map(invoice -> invoice.getManagementFee() != null ? invoice.getManagementFee() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal waterFee = paidInvoices.stream()
            .map(invoice -> invoice.getWaterFee() != null ? invoice.getWaterFee() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal electricityFee = paidInvoices.stream()
            .map(invoice -> invoice.getElectricityFee() != null ? invoice.getElectricityFee() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal parkingFee = paidInvoices.stream()
            .map(invoice -> invoice.getParkingFee() != null ? invoice.getParkingFee() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal otherFee = paidInvoices.stream()
            .map(invoice -> invoice.getOtherFee() != null ? invoice.getOtherFee() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth(), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Maintenance> completedMaintenances = maintenanceRepository
            .findByStatusAndCompletedDateBetween(MaintenanceStatus.COMPLETED, startDate, endDate);
        
        BigDecimal maintenanceExpense = completedMaintenances.stream()
            .map(m -> m.getCost() != null ? m.getCost() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<InvoiceStatus> outstandingStatuses = Arrays.asList(InvoiceStatus.PENDING, InvoiceStatus.OVERDUE);
        List<Invoice> outstandingInvoices;
        
        if (request.getBlock() != null && !request.getBlock().isEmpty()) {
            outstandingInvoices = financialRepository.findByStatusInAndApartmentBlock(
                outstandingStatuses, request.getBlock());
        } else {
            outstandingInvoices = financialRepository.findByStatusIn(outstandingStatuses);
        }
        
        BigDecimal totalOutstanding = outstandingInvoices.stream()
            .map(Invoice::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Long totalInvoicesCount = (long) invoices.size();
        Long paidInvoicesCount = (long) paidInvoices.size();
        
        Long overdueInvoicesCount = invoices.stream()
            .filter(i -> i.getStatus() == InvoiceStatus.OVERDUE)
            .collect(Collectors.counting());
            
        Integer outstandingInvoicesCount = outstandingInvoices.size();
        
        List<ApartmentFinancialDetail> apartmentDetails = invoices.stream()
            .map(this::mapToApartmentFinancialDetail)
            .collect(Collectors.toList());
        
        FinancialReportResponse response = FinancialReportResponse.builder()
            .month(request.getMonth())
            .year(request.getYear())
            .block(request.getBlock())
            .totalRevenue(totalRevenue)
            .managementFee(managementFee)
            .waterFee(waterFee)
            .electricityFee(electricityFee)
            .parkingFee(parkingFee)
            .otherFee(otherFee)
            .totalExpense(maintenanceExpense)
            .maintenanceExpense(maintenanceExpense)
            .netProfit(totalRevenue.subtract(maintenanceExpense))
            .totalOutstanding(totalOutstanding)
            .outstandingInvoicesCount(outstandingInvoicesCount)
            .totalInvoices(totalInvoicesCount.intValue())
            .paidInvoices(paidInvoicesCount.intValue())
            .overdueInvoices(overdueInvoicesCount.intValue())
            .apartmentDetails(apartmentDetails)
            .build();
        
        return ApiResult.success(response, "Tạo báo cáo tài chính thành công");
    }

    @Override
    public ApiResult<OutstandingReportResponse> getOutstandingReport(String block) {
        List<Invoice> overdueInvoices = financialRepository.findByStatusAndDueDateBefore(
            InvoiceStatus.OVERDUE, LocalDate.now());
        
        if (block != null && !block.isEmpty()) {
            overdueInvoices = overdueInvoices.stream()
                .filter(i -> block.equals(i.getApartment().getBlock()))
                .collect(Collectors.toList());
        }
        
        List<Invoice> pendingOverdueInvoices = financialRepository.findByStatusAndDueDateBefore(
            InvoiceStatus.PENDING, LocalDate.now());
            
        if (block != null && !block.isEmpty()) {
            pendingOverdueInvoices = pendingOverdueInvoices.stream()
                .filter(i -> block.equals(i.getApartment().getBlock()))
                .collect(Collectors.toList());
        }
        
        overdueInvoices.addAll(pendingOverdueInvoices);
        
        BigDecimal totalOutstanding = overdueInvoices.stream()
            .map(Invoice::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<OutstandingReportResponse.OutstandingDetail> details = overdueInvoices.stream()
            .map(this::mapToOutstandingDetail)
            .collect(Collectors.toList());
        
        OutstandingReportResponse response = OutstandingReportResponse.builder()
            .totalOutstanding(totalOutstanding)
            .totalOverdueInvoices(overdueInvoices.size())
            .outstandingDetails(details)
            .build();
        
        return ApiResult.success(response, "Lấy báo cáo công nợ thành công");
    }

    @Override
    public ApiResult<YearlyFinancialReportResponse> getYearlyFinancialReport(Integer year, String block) {
        List<YearlyFinancialReportResponse.MonthlyFinancialSummary> monthlyDetails = new ArrayList<>();
        
        // Tổng kết cả năm
        BigDecimal totalYearRevenue = BigDecimal.ZERO;
        BigDecimal totalYearExpense = BigDecimal.ZERO;
        BigDecimal totalYearOutstanding = BigDecimal.ZERO;
        Integer totalYearInvoices = 0;
        Integer totalYearPaidInvoices = 0;
        Integer totalYearOverdueInvoices = 0;
        
        // Variables để tìm tháng tốt nhất/tệ nhất
        BigDecimal maxRevenue = BigDecimal.ZERO;
        BigDecimal minRevenue = null;
        String bestMonth = "";
        String worstMonth = "";
        
        // Lặp qua 12 tháng
        for (int month = 1; month <= 12; month++) {
            FinancialReportRequest monthRequest = FinancialReportRequest.builder()
                .month(month)
                .year(year)
                .block(block)
                .build();
                
            ApiResult<FinancialReportResponse> monthResult = generateFinancialReport(monthRequest);
            FinancialReportResponse monthData = monthResult.getData();
            
            // Tạo summary cho tháng
            YearlyFinancialReportResponse.MonthlyFinancialSummary monthlySummary = 
                YearlyFinancialReportResponse.MonthlyFinancialSummary.builder()
                    .month(month)
                    .monthName(MONTH_NAMES[month])
                    .revenue(monthData.getTotalRevenue())
                    .expense(monthData.getTotalExpense())
                    .profit(monthData.getNetProfit())
                    .outstanding(monthData.getTotalOutstanding())
                    .totalInvoices(monthData.getTotalInvoices())
                    .paidInvoices(monthData.getPaidInvoices())
                    .overdueInvoices(monthData.getOverdueInvoices())
                    .build();
                    
            monthlyDetails.add(monthlySummary);
            
            // Cộng dồn cho tổng năm
            totalYearRevenue = totalYearRevenue.add(monthData.getTotalRevenue());
            totalYearExpense = totalYearExpense.add(monthData.getTotalExpense());
            totalYearInvoices += monthData.getTotalInvoices();
            totalYearPaidInvoices += monthData.getPaidInvoices();
            totalYearOverdueInvoices += monthData.getOverdueInvoices();
            
            // Tìm tháng tốt nhất/tệ nhất
            if (monthData.getTotalRevenue().compareTo(maxRevenue) > 0) {
                maxRevenue = monthData.getTotalRevenue();
                bestMonth = MONTH_NAMES[month];
            }
            
            if (minRevenue == null || monthData.getTotalRevenue().compareTo(minRevenue) < 0) {
                minRevenue = monthData.getTotalRevenue();
                worstMonth = MONTH_NAMES[month];
            }
        }
        
        // Tính công nợ hiện tại (không phải tổng cả năm)
        List<InvoiceStatus> outstandingStatuses = Arrays.asList(InvoiceStatus.PENDING, InvoiceStatus.OVERDUE);
        List<Invoice> currentOutstandingInvoices;
        
        if (block != null && !block.isEmpty()) {
            currentOutstandingInvoices = financialRepository.findByStatusInAndApartmentBlock(
                outstandingStatuses, block);
        } else {
            currentOutstandingInvoices = financialRepository.findByStatusIn(outstandingStatuses);
        }
        
        totalYearOutstanding = currentOutstandingInvoices.stream()
            .map(Invoice::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Tính tỷ lệ thu phí cả năm
        BigDecimal yearCollectionRate = BigDecimal.ZERO;
        if (totalYearInvoices > 0) {
            yearCollectionRate = BigDecimal.valueOf(totalYearPaidInvoices)
                .divide(BigDecimal.valueOf(totalYearInvoices), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        }
        
        // Tính trung bình hàng tháng
        BigDecimal averageMonthlyRevenue = totalYearRevenue.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal averageMonthlyExpense = totalYearExpense.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        
        YearlyFinancialReportResponse response = YearlyFinancialReportResponse.builder()
            .year(year)
            .block(block)
            .totalYearRevenue(totalYearRevenue)
            .totalYearExpense(totalYearExpense)
            .totalYearProfit(totalYearRevenue.subtract(totalYearExpense))
            .totalYearOutstanding(totalYearOutstanding)
            .totalYearInvoices(totalYearInvoices)
            .totalYearPaidInvoices(totalYearPaidInvoices)
            .totalYearOverdueInvoices(totalYearOverdueInvoices)
            .yearCollectionRate(yearCollectionRate)
            .monthlyDetails(monthlyDetails)
            .bestMonth(bestMonth)
            .worstMonth(worstMonth)
            .averageMonthlyRevenue(averageMonthlyRevenue)
            .averageMonthlyExpense(averageMonthlyExpense)
            .build();
        
        return ApiResult.success(response, "Tạo báo cáo tài chính năm " + year + " thành công");
    }
    
    private ApartmentFinancialDetail mapToApartmentFinancialDetail(Invoice invoice) {
        List<Payment> invoicePayments = paymentRepository.findByInvoiceId(invoice.getId());
        BigDecimal paidAmount = invoicePayments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal outstandingAmount = invoice.getTotalAmount().subtract(paidAmount);
        
        List<Invoice> apartmentOverdueInvoices = financialRepository
            .findByStatusAndDueDateBefore(InvoiceStatus.OVERDUE, LocalDate.now())
            .stream()
            .filter(i -> i.getApartment().getId().equals(invoice.getApartment().getId()))
            .collect(Collectors.toList());
        
        return ApartmentFinancialDetail.builder()
            .apartmentNumber(invoice.getApartment().getApartmentNumber())
            .block(invoice.getApartment().getBlock())
            .floor(invoice.getApartment().getFloor())
            .ownerName(invoice.getApartment().getOwner() != null ? 
                invoice.getApartment().getOwner().getUsername() : "")
            .totalAmount(invoice.getTotalAmount())
            .paidAmount(paidAmount)
            .outstandingAmount(outstandingAmount)
            .status(invoice.getStatus().getDisplayName())
            .overdueInvoicesCount(apartmentOverdueInvoices.size())
            .build();
    }
    
    private OutstandingReportResponse.OutstandingDetail mapToOutstandingDetail(Invoice invoice) {
        long overdueDays = ChronoUnit.DAYS.between(invoice.getDueDate(), LocalDate.now());
        
        return OutstandingReportResponse.OutstandingDetail.builder()
            .apartmentNumber(invoice.getApartment().getApartmentNumber())
            .block(invoice.getApartment().getBlock())
            .ownerName(invoice.getApartment().getOwner() != null ? 
                invoice.getApartment().getOwner().getUsername() : "")
            .invoiceNumber(invoice.getInvoiceNumber())
            .month(invoice.getMonth())
            .year(invoice.getYear())
            .totalAmount(invoice.getTotalAmount())
            .dueDate(invoice.getDueDate())
            .overdueDays(overdueDays)
            .status(invoice.getStatus().getDisplayName())
            .build();
    }
}