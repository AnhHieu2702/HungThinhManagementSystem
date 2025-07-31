package com.apartment.services.interfaces;

import java.util.List;
import java.util.UUID;

import com.apartment.models.dtos.invoices.InvoiceBulkCreateRequest;
import com.apartment.models.dtos.invoices.InvoiceCreateRequest;
import com.apartment.models.dtos.invoices.InvoiceGetsResponse;
import com.apartment.models.dtos.invoices.InvoiceUpdateRequest;
import com.apartment.models.global.ApiResult;

public interface IInvoiceService {
    ApiResult<UUID> createInvoice(InvoiceCreateRequest apiRequest);
    
    ApiResult<String> createBulkInvoices(InvoiceBulkCreateRequest apiRequest);
    
    ApiResult<String> updateInvoice(UUID invoiceId, InvoiceUpdateRequest apiRequest);
    
    ApiResult<List<InvoiceGetsResponse>> getInvoicesWithFilter(String status, Integer month, Integer year);
    
    ApiResult<List<InvoiceGetsResponse>> getInvoicesByApartment(String apartmentNumber);
}