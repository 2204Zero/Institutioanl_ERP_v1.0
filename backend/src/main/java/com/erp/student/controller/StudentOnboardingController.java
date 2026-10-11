package com.erp.student.controller;

import com.erp.student.entity.Student;
import com.erp.student.service.StudentOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admission-workflows")
@RequiredArgsConstructor
public class StudentOnboardingController {

    private final StudentOnboardingService onboardingService;

    @PostMapping("/applications/{id}/onboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Student> onboardStudent(@PathVariable Long id) {
        Student student = onboardingService.onboardStudent(id);
        return ResponseEntity.ok(student);
    }
}
