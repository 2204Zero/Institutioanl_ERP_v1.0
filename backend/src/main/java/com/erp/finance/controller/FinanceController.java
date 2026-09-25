package com.erp.finance.controller;

import com.erp.finance.dto.FeeCreationRequest;
import com.erp.finance.dto.FeeRecordResponse;
import com.erp.finance.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance")
@Tag(name = "Finance Management", description = "Finance endpoints protected by Finance role and FEES_MANAGE permission")
@SecurityRequirement(name = "BearerAuth")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/fees")
    @Operation(summary = "Create fee invoice / manage fees", description = "Restricted to Finance officers with FEES_MANAGE permission")
    @PreAuthorize("hasAuthority('FEES_MANAGE') or hasRole('FINANCE')")
    public ResponseEntity<FeeRecordResponse> createFeeInvoice(@Valid @RequestBody FeeCreationRequest request) {
        FeeRecordResponse response = financeService.createFeeInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/fees/student/{studentId}")
    @Operation(summary = "Get student fee records", description = "Accessible by Student, Parent, Finance, and Admin")
    @PreAuthorize("hasAnyAuthority('STUDENT_FEES_READ', 'FEES_READ') or hasAnyRole('STUDENT', 'PARENT', 'FINANCE', 'ADMIN')")
    public ResponseEntity<List<FeeRecordResponse>> getStudentFees(@PathVariable Long studentId) {
        return ResponseEntity.ok(financeService.getFeesByStudent(studentId));
    }

    @GetMapping("/fees")
    @Operation(summary = "Get all fee records", description = "Accessible by Finance, Admin, and Super Admin")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<FeeRecordResponse>> getAllFees() {
        return ResponseEntity.ok(financeService.getAllFees());
    }
}

