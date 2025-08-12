package com.apartment.services.interfaces;

import com.apartment.models.dtos.financial.FinancialReportRequest;
import com.apartment.models.dtos.financial.FinancialReportResponse;
import com.apartment.models.dtos.financial.OutstandingReportResponse;
import com.apartment.models.dtos.financial.YearlyFinancialReportResponse;
import com.apartment.models.global.ApiResult;

public interface IFinancialService {
    ApiResult<FinancialReportResponse> generateFinancialReport(FinancialReportRequest request);
    
    ApiResult<OutstandingReportResponse> getOutstandingReport(String block);
    
    ApiResult<YearlyFinancialReportResponse> getYearlyFinancialReport(Integer year, String block);
}