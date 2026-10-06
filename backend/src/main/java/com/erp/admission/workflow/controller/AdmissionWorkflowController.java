package com.erp.admission.workflow.controller;

import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.elegibility.service.EligibilityCheckService;
import com.erp.admission.merit.service.MeritListService;
import com.erp.admission.workflow.service.AdmissionWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admission-workflows")
@RequiredArgsConstructor
public class AdmissionWorkflowController {

    private final AdmissionWorkflowService workflowService;
    private final EligibilityCheckService eligibilityService;
    private final MeritListService meritListService;

    @PatchMapping("/applications/{id}/process")
    public ResponseEntity<AdmissionApplication> processWorkflow(
            @PathVariable Long id,
            @RequestParam ApplicationStatus targetStatus) {
        return ResponseEntity.ok(workflowService.processWorkflowStep(id, targetStatus));
    }

    @GetMapping("/applications/{id}/eligibility")
    public ResponseEntity<Boolean> checkEligibility(@PathVariable Long id) {
        return ResponseEntity.ok(eligibilityService.checkEligibility(id));
    }

    @GetMapping("/programs/{programId}/merit-list")
    public ResponseEntity<List<AdmissionApplication>> generateMeritList(
            @PathVariable Long programId,
            @RequestParam Long academicYearId) {
        return ResponseEntity.ok(meritListService.generateMeritList(programId, academicYearId));
    }
}
