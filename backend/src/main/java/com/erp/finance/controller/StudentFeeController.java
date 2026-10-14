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
    public ResponseEntity<StudentFeeResponseDto> assignFee(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long feeStructureId,
            @RequestParam(required = false) Long academicYearId,
            @RequestBody(required = false) com.erp.finance.dto.FeeAssignRequestDto body) {
        Long targetStudentId = studentId != null ? studentId : (body != null ? body.getStudentId() : null);
        Long targetFeeStructureId = feeStructureId != null ? feeStructureId : (body != null ? body.getFeeStructureId() : null);
        Long targetAcademicYearId = academicYearId != null ? academicYearId : (body != null ? body.getAcademicYearId() : null);

        return ResponseEntity.ok(StudentFeeResponseDto.fromEntity(
                studentFeeService.assignFeeStructure(targetStudentId, targetFeeStructureId, targetAcademicYearId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN') or @securityOwnershipService.canAccessStudentFeeFinance(authentication, #id)")
    public ResponseEntity<StudentFeeResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(StudentFeeResponseDto.fromEntity(studentFeeService.getById(id)));
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
