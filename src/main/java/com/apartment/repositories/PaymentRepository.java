package com.apartment.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.models.entities.bases.Payment;
import com.apartment.models.entities.enums.PaymentMethod;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    // Lấy thanh toán theo hóa đơn
    List<Payment> findByInvoiceId(UUID invoiceId);
    
    // Lấy thanh toán theo tháng/năm của hóa đơn
    List<Payment> findByInvoiceMonthAndInvoiceYear(Integer month, Integer year);
    
    // Lấy thanh toán theo tháng/năm và block
    List<Payment> findByInvoiceMonthAndInvoiceYearAndInvoiceApartmentBlock(
        Integer month, Integer year, String block);
    
    // Tìm thanh toán theo mã thanh toán
    Optional<Payment> findByPaymentCode(String paymentCode);
    
    // Tìm thanh toán theo mã giao dịch
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Lấy thanh toán theo phương thức thanh toán
    List<Payment> findByPaymentMethod(PaymentMethod paymentMethod);
    
    // Lấy thanh toán theo số căn hộ
    List<Payment> findByInvoiceApartmentApartmentNumber(String apartmentNumber);
    
    // Lấy thanh toán theo ID căn hộ
    List<Payment> findByInvoiceApartmentId(UUID apartmentId);
    
    // Lấy thanh toán theo số hóa đơn
    List<Payment> findByInvoiceInvoiceNumber(String invoiceNumber);
    
    // Lấy thanh toán theo căn hộ và tháng/năm
    List<Payment> findByInvoiceApartmentApartmentNumberAndInvoiceMonthAndInvoiceYear(
        String apartmentNumber, Integer month, Integer year);
    
    // Lấy thanh toán theo phương thức và căn hộ
    List<Payment> findByPaymentMethodAndInvoiceApartmentApartmentNumber(
        PaymentMethod paymentMethod, String apartmentNumber);
    
    // Kiểm tra thanh toán đã tồn tại cho hóa đơn chưa
    boolean existsByInvoiceId(UUID invoiceId);
    
    // Kiểm tra mã thanh toán đã tồn tại chưa
    boolean existsByPaymentCode(String paymentCode);
    
    // Kiểm tra mã giao dịch đã tồn tại chưa
    boolean existsByTransactionId(String transactionId);
}