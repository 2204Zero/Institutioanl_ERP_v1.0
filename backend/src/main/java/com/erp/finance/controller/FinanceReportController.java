package com.erp.finance.controller;

import com.erp.finance.dto.FinanceSummaryResponseDto;
import com.erp.finance.service.FinanceReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/finance/reports")
public class FinanceReportController {
    private final FinanceReportService financeReportService;

    public FinanceReportController(FinanceReportService financeReportService) {
        this.financeReportService = financeReportService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('FINANCE_REPORT_VIEW') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FinanceSummaryResponseDto> getSummary() {
        return ResponseEntity.ok(financeReportService.getFinancialSummaryDto());
    }
}
