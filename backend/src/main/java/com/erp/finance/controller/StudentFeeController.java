package com.erp.finance.controller;

import com.erp.finance.dto.StudentFeeResponseDto;
import com.erp.finance.service.StudentFeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/student-fees")
public class StudentFeeController {
    private final StudentFeeService studentFeeService;

    public StudentFeeController(StudentFeeService studentFeeService) {
        this.studentFeeService = studentFeeService;
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('FEE_ASSIGNMENT_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StudentFeeResponseDto> assignFee(@RequestParam Long studentId, @RequestParam Long feeStructureId, @RequestParam Long academicYearId) {
        return ResponseEntity.ok(StudentFeeResponseDto.fromEntity(studentFeeService.assignFeeStructure(studentId, feeStructureId, academicYearId)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FEE_ASSIGNMENT_VIEW') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<StudentFeeResponseDto>> getAllStudentFees() {
        return ResponseEntity.ok(studentFeeService.getAllStudentFees().stream()
                .map(StudentFeeResponseDto::fromEntity)
                .toList());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN') or @securityOwnershipService.canAccessStudentFinance(authentication, #studentId)")
    public ResponseEntity<List<StudentFeeResponseDto>> getStudentFees(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentFeeService.getStudentFees(studentId).stream()
                .map(StudentFeeResponseDto::fromEntity)
                .toList());
    }
}
