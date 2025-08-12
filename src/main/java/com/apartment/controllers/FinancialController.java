package com.apartment.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.models.dtos.financial.FinancialReportRequest;
import com.apartment.models.dtos.financial.FinancialReportResponse;
import com.apartment.models.dtos.financial.OutstandingReportResponse;
import com.apartment.models.dtos.financial.YearlyFinancialReportResponse;
import com.apartment.models.global.ApiResult;
import com.apartment.services.interfaces.IFinancialService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api")
@Tag(name = "Financial Management")
public class FinancialController extends ApiBaseController {
    
    private final IFinancialService financialService;

    public FinancialController(IFinancialService financialService) {
        this.financialService = financialService;
    }

    @PostMapping("admin-accountant/financial/report")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<FinancialReportResponse>> generateFinancialReport(
            @Valid @RequestBody FinancialReportRequest apiRequest) {
        return executeApiResult(() -> financialService.generateFinancialReport(apiRequest));
    }

    @GetMapping("admin-accountant/financial/outstanding")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<OutstandingReportResponse>> getOutstandingReport(
            @RequestParam(required = false) String block) {
        return executeApiResult(() -> financialService.getOutstandingReport(block));
    }

    @GetMapping("admin-accountant/financial/yearly/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ACCOUNTANT')")
    public ResponseEntity<ApiResult<YearlyFinancialReportResponse>> getYearlyFinancialReport(
            @PathVariable Integer year,
            @RequestParam(required = false) String block) {
        return executeApiResult(() -> financialService.getYearlyFinancialReport(year, block));
    }
}