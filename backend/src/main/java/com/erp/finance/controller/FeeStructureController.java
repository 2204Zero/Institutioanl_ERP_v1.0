package com.erp.finance.controller;

import com.erp.finance.dto.FeeStructureResponseDto;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.service.FeeStructureService;
import org.springframework.http.HttpStatus;
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
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeStructureResponseDto> createFeeStructure(@RequestBody FeeStructure feeStructure) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FeeStructureResponseDto.fromEntity(feeStructureService.createFeeStructure(feeStructure)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_VIEW') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<FeeStructureResponseDto>> getAll() {
        return ResponseEntity.ok(feeStructureService.getAll().stream()
                .map(FeeStructureResponseDto::fromEntity)
                .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_VIEW') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeStructureResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(FeeStructureResponseDto.fromEntity(feeStructureService.getById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeStructureResponseDto> updateFeeStructure(
            @PathVariable Long id,
            @RequestBody FeeStructure feeStructure) {
        return ResponseEntity.ok(FeeStructureResponseDto.fromEntity(feeStructureService.updateFeeStructure(id, feeStructure)));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeStructureResponseDto> approveFeeStructure(@PathVariable Long id) {
        return ResponseEntity.ok(FeeStructureResponseDto.fromEntity(feeStructureService.approveFeeStructure(id)));
    }

    @PostMapping("/{id}/components")
    @PreAuthorize("hasAuthority('FEE_STRUCTURE_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<FeeStructureResponseDto> addComponent(
            @PathVariable Long id,
            @RequestParam Long headId,
            @RequestParam java.math.BigDecimal amount) {
        return ResponseEntity.ok(FeeStructureResponseDto.fromEntity(feeStructureService.addComponent(id, headId, amount)));
    }
}
