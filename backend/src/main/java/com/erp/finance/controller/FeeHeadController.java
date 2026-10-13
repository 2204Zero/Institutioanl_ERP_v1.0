package com.erp.finance.controller;

import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/fee-heads")
public class FeeHeadController {

    private final FeeHeadRepository feeHeadRepository;

    public FeeHeadController(FeeHeadRepository feeHeadRepository) {
        this.feeHeadRepository = feeHeadRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_VIEW') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<FeeHead>> getAll() {
        return ResponseEntity.ok(feeHeadRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeHead> createFeeHead(@RequestBody FeeHead feeHead) {
        if (feeHead.getCode() == null || feeHead.getCode().isBlank()) {
            feeHead.setCode("HEAD-" + System.currentTimeMillis());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(feeHeadRepository.save(feeHead));
    }
}
