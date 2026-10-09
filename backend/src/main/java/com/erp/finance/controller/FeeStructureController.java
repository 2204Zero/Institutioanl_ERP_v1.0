package com.erp.finance.controller;

import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.service.FeeStructureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/fee-structures")
public class FeeStructureController {
    private final FeeStructureService feeStructureService;

    public FeeStructureController(FeeStructureService feeStructureService) {
        this.feeStructureService = feeStructureService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_CREATE') or hasRole('FINANCE')")
    public ResponseEntity<FeeStructure> createFeeStructure(@RequestBody FeeStructure feeStructure) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(feeStructureService.createFeeStructure(feeStructure));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_VIEW') or hasRole('FINANCE')")
    public ResponseEntity<List<FeeStructure>> getAll() {
        return ResponseEntity.ok(feeStructureService.getAll());
    }
}
