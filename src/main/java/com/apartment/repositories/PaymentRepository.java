package com.apartment.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    // Lấy thanh toán theo hóa đơn
    List<Payment> findByInvoiceId(UUID invoiceId);
    
    // Lấy thanh toán theo tháng/năm của hóa đơn
    List<Payment> findByInvoiceMonthAndInvoiceYear(Integer month, Integer year);
    
    // Lấy thanh toán theo tháng/năm và block
    List<Payment> findByInvoiceMonthAndInvoiceYearAndInvoiceApartmentBlock(
        Integer month, Integer year, String block);
}