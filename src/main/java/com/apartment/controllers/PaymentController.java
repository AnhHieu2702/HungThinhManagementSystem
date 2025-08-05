package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.payments.PaymentGetsResponse;
import com.apartment.models.dtos.invoices.InvoicePaymentRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IPaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api")
@Tag(name = "Payment Management")
public class PaymentController extends ApiBaseController {
    private final IPaymentService paymentService;

    public PaymentController(IPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("admin-accountant-resident/invoices/{invoiceNumber}/payment")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT') or hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<String>> processInvoicePayment(
            @PathVariable String invoiceNumber,
            @Valid @RequestBody InvoicePaymentRequest apiRequest) {
        return executeApiResult(() -> paymentService.processInvoicePayment(invoiceNumber, apiRequest));
    }

    @GetMapping("admin-accountant-resident/payments/apartment/{apartmentNumber}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT') or hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<List<PaymentGetsResponse>>> getPaymentsByApartment(
            @PathVariable String apartmentNumber) {
        return executeApiResult(() -> paymentService.getPaymentsByApartment(apartmentNumber));
    }

    @GetMapping("admin-accountant-resident/payments/invoice/{invoiceNumber}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT') or hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<List<PaymentGetsResponse>>> getPaymentsByInvoice(
            @PathVariable String invoiceNumber) {
        return executeApiResult(() -> paymentService.getPaymentsByInvoice(invoiceNumber));
    }

    @GetMapping("admin-accountant-resident/payments/code/{paymentCode}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT') or hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<PaymentGetsResponse>> getPaymentByCode(@PathVariable String paymentCode) {
        return executeApiResult(() -> paymentService.getPaymentByCode(paymentCode));
    }
}