package com.apartment.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Invoice;
import com.apartment.models.entities.enums.InvoiceStatus;

public interface FinancialRepository extends JpaRepository<Invoice, UUID> {
    
    // Lấy tất cả hóa đơn theo tháng/năm
    List<Invoice> findByMonthAndYear(Integer month, Integer year);
    
    // Lấy hóa đơn theo tháng/năm và block
    List<Invoice> findByMonthAndYearAndApartmentBlock(Integer month, Integer year, String block);
    
    // Lấy hóa đơn theo tháng/năm (khi block null)
    List<Invoice> findByMonthAndYearAndApartmentBlockIsNull(Integer month, Integer year);
    
    // Lấy hóa đơn quá hạn
    List<Invoice> findByStatusAndDueDateBefore(InvoiceStatus status, LocalDate currentDate);
    
    // Lấy hóa đơn theo trạng thái và tháng/năm
    List<Invoice> findByMonthAndYearAndStatus(Integer month, Integer year, InvoiceStatus status);
    
    // Lấy hóa đơn theo trạng thái
    List<Invoice> findByStatusIn(List<InvoiceStatus> statuses);
    
    // Lấy hóa đơn theo trạng thái và block
    List<Invoice> findByStatusInAndApartmentBlock(List<InvoiceStatus> statuses, String block);
    
    // Lấy hóa đơn theo block
    List<Invoice> findByApartmentBlock(String block);
}