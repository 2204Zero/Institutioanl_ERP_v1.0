package com.erp.finance.controller;

import com.erp.finance.student_fee.entity.StudentFee;
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
    @PreAuthorize("hasAuthority('FEE_ASSIGNMENT_CREATE') or hasRole('FINANCE')")
    public ResponseEntity<StudentFee> assignFee(@RequestParam Long studentId, @RequestParam Long feeStructureId, @RequestParam Long academicYearId) {
        return ResponseEntity.ok(studentFeeService.assignFeeStructure(studentId, feeStructureId, academicYearId));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('FEE_ASSIGNMENT_VIEW') or hasRole('FINANCE')")
    public ResponseEntity<List<StudentFee>> getAllStudentFees() {
        return ResponseEntity.ok(studentFeeService.getAllStudentFees());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('FEE_ASSIGNMENT_VIEW') or hasRole('FINANCE') or hasRole('STUDENT')")
    public ResponseEntity<List<StudentFee>> getStudentFees(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentFeeService.getStudentFees(studentId));
    }
}
