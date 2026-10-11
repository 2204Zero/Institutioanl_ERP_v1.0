package com.erp.admission.applicant.controller;

import com.erp.admission.applicant.dto.ApplicantDto;
import com.erp.admission.applicant.service.ApplicantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applicants")
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService applicantService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApplicantDto> registerApplicant(@RequestBody ApplicantDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicantService.registerApplicant(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.List<ApplicantDto>> getAllApplicants() { return ResponseEntity.ok(applicantService.getAllApplicants()); }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApplicantDto> getApplicant(@PathVariable Long id) {
        return ResponseEntity.ok(applicantService.getApplicant(id));
    }
}


