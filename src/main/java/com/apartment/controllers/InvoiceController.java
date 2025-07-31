package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.invoices.InvoiceBulkCreateRequest;
import com.apartment.models.dtos.invoices.InvoiceCreateRequest;
import com.apartment.models.dtos.invoices.InvoiceGetsResponse;
import com.apartment.models.dtos.invoices.InvoiceUpdateRequest;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IInvoiceService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
@Tag(name = "Invoice Management")
public class InvoiceController extends ApiBaseController {
    private final IInvoiceService invoiceService;

    public InvoiceController(IInvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("admin-accountant/invoices")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<UUID>> createInvoice(@Valid @RequestBody InvoiceCreateRequest apiRequest) {
        return executeApiResult(() -> invoiceService.createInvoice(apiRequest));
    }

    @PostMapping("admin-accountant/invoices/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<String>> createBulkInvoices(
            @Valid @RequestBody InvoiceBulkCreateRequest apiRequest) {
        return executeApiResult(() -> invoiceService.createBulkInvoices(apiRequest));
    }

    @PutMapping("admin-accountant/invoices/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<String>> updateInvoice(@PathVariable UUID id,
            @Valid @RequestBody InvoiceUpdateRequest apiRequest) {
        return executeApiResult(() -> invoiceService.updateInvoice(id, apiRequest));
    }

    @GetMapping("admin-accountant/invoices/filter")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<List<InvoiceGetsResponse>>> getInvoicesWithFilter(
            @Parameter(description = "Trạng thái hóa đơn: PENDING, PAID, OVERDUE, CANCELLED") @RequestParam(required = false) String status,
            @Parameter(description = "Tháng (1-12)") @RequestParam(required = false) Integer month,
            @Parameter(description = "Năm") @RequestParam(required = false) Integer year) {
        return executeApiResult(() -> invoiceService.getInvoicesWithFilter(status, month, year));
    }

    @GetMapping("admin-accountant-resident/invoices/apartment/{apartmentNumber}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT') or hasRole('RESIDENT')")
    public ResponseEntity<ApiResult<List<InvoiceGetsResponse>>> getInvoicesByApartment(
            @PathVariable String apartmentNumber) {
        return executeApiResult(() -> invoiceService.getInvoicesByApartment(apartmentNumber));
    }
}