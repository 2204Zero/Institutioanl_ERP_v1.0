package com.erp.admission.application.controller;

import com.erp.admission.application.dto.AdmissionApplicationDto;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.service.AdmissionApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admission-applications")
@RequiredArgsConstructor
public class AdmissionApplicationController {

    private final AdmissionApplicationService applicationService;

    @PostMapping("/draft")
    public ResponseEntity<AdmissionApplicationDto> createDraft(
            @RequestParam Long applicantId,
            @RequestParam Long programId,
            @RequestParam Long academicYearId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.createDraftApplication(applicantId, programId, academicYearId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<AdmissionApplicationDto> submitApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdmissionApplicationDto> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status, remarks));
    }
}
