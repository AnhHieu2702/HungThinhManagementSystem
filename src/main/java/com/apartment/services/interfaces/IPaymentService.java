package com.apartment.services.interfaces;

import java.util.List;

import com.apartment.models.dtos.payments.PaymentGetsResponse;
import com.apartment.models.dtos.invoices.InvoicePaymentRequest;
import com.apartment.models.global.ApiResult;

public interface IPaymentService {
    ApiResult<String> processInvoicePayment(String invoiceNumber, InvoicePaymentRequest apiRequest);
    
    ApiResult<List<PaymentGetsResponse>> getPaymentsByApartment(String apartmentNumber);
    
    ApiResult<List<PaymentGetsResponse>> getPaymentsByInvoice(String invoiceNumber);
    
    ApiResult<PaymentGetsResponse> getPaymentByCode(String paymentCode);
}