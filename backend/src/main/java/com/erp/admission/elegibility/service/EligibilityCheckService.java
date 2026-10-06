package com.erp.admission.elegibility.service;

import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EligibilityCheckService {

    private final AdmissionApplicationRepository applicationRepository;
    private final ProgramRepository programRepository;

    @Transactional
    public boolean checkEligibility(Long applicationId) {
        AdmissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Program program = programRepository.findById(application.getProgram().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Program not found"));

        // Dummy Rule: If merit score is < 50, not eligible. 
        // In reality, this would check previous education records and program criteria.
        if (application.getMeritScore() != null && application.getMeritScore() < 50.0) {
            application.setReviewerRemarks("Applicant does not meet minimum merit score for program.");
            applicationRepository.save(application);
            return false;
        }

        return true;
    }
}
