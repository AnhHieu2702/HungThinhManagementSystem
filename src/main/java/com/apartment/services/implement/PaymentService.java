package com.apartment.services.implement;

import java.time.LocalDateTime;
import java.util.List;

import com.apartment.exceptions.UserMessageException;
import com.apartment.models.dtos.payments.PaymentGetsResponse;
import com.apartment.models.dtos.invoices.InvoicePaymentRequest;
import com.apartment.models.entities.bases.Invoice;
import com.apartment.models.entities.bases.Payment;
import com.apartment.models.entities.enums.InvoiceStatus;
import com.apartment.models.entities.enums.PaymentMethod;
import com.apartment.models.global.ApiResult;
import com.apartment.repositories.InvoiceRepository;
import com.apartment.repositories.PaymentRepository;
import com.apartment.services.interfaces.IPaymentService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService implements IPaymentService {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    @Transactional
    public ApiResult<String> processInvoicePayment(String invoiceNumber, InvoicePaymentRequest apiRequest) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new UserMessageException("Hóa đơn không tồn tại"));

        // Kiểm tra hóa đơn đã được thanh toán chưa
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new UserMessageException("Hóa đơn đã được thanh toán");
        }

        // Kiểm tra số tiền thanh toán
        if (apiRequest.getAmount().compareTo(invoice.getTotalAmount()) > 0) {
            throw new UserMessageException("Số tiền thanh toán không được vượt quá tổng tiền hóa đơn");
        }

        // Kiểm tra mã giao dịch đã tồn tại chưa (nếu có)
        if (apiRequest.getTransactionId() != null && !apiRequest.getTransactionId().isEmpty()) {
            if (paymentRepository.existsByTransactionId(apiRequest.getTransactionId())) {
                throw new UserMessageException("Mã giao dịch đã tồn tại");
            }
        }

        Payment newPayment = new Payment();
        newPayment.setPaymentCode(generatePaymentCode());
        newPayment.setInvoice(invoice);
        newPayment.setAmount(apiRequest.getAmount());
        newPayment.setPaymentDate(LocalDateTime.now());
        newPayment.setPaymentMethod(PaymentMethod.valueOf(apiRequest.getPaymentMethod()));
        newPayment.setTransactionId(apiRequest.getTransactionId());
        newPayment.setNotes(apiRequest.getNotes());

        paymentRepository.save(newPayment);

        // Cập nhật trạng thái hóa đơn nếu thanh toán đủ
        if (apiRequest.getAmount().compareTo(invoice.getTotalAmount()) == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }

        return ApiResult.success(null, "Thanh toán hóa đơn " + invoiceNumber + " thành công");
    }

    @Override
    public ApiResult<List<PaymentGetsResponse>> getPaymentsByApartment(String apartmentNumber) {
        List<Payment> payments = paymentRepository.findByInvoiceApartmentApartmentNumber(apartmentNumber);
        List<PaymentGetsResponse> responseList = payments.stream()
                .map(this::mapToPaymentResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thanh toán theo căn hộ thành công");
    }

    @Override
    public ApiResult<List<PaymentGetsResponse>> getPaymentsByInvoice(String invoiceNumber) {
        List<Payment> payments = paymentRepository.findByInvoiceInvoiceNumber(invoiceNumber);
        List<PaymentGetsResponse> responseList = payments.stream()
                .map(this::mapToPaymentResponse)
                .toList();

        return ApiResult.success(responseList, "Lấy danh sách thanh toán theo hóa đơn thành công");
    }

    @Override
    public ApiResult<PaymentGetsResponse> getPaymentByCode(String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new UserMessageException("Thanh toán không tồn tại"));

        PaymentGetsResponse response = mapToPaymentResponse(payment);
        return ApiResult.success(response, "Lấy thông tin thanh toán thành công");
    }

    private PaymentGetsResponse mapToPaymentResponse(Payment payment) {
        return new PaymentGetsResponse(
                payment.getId(),
                payment.getPaymentCode(),
                payment.getInvoice().getInvoiceNumber(),
                payment.getInvoice().getApartment().getApartmentNumber(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getPaymentMethod().getDisplayName(),
                payment.getTransactionId(),
                payment.getNotes());
    }

    private String generatePaymentCode() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        return "PAY" + timestamp.substring(timestamp.length() - 8); // Lấy 8 chữ số cuối
    }
}