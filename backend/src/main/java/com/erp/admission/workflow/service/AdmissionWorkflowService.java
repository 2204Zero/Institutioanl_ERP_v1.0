package com.erp.admission.workflow.service;

import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdmissionWorkflowService {

    private final AdmissionApplicationRepository applicationRepository;

    @Transactional
    public AdmissionApplication processWorkflowStep(Long applicationId, ApplicationStatus targetStatus) {
        AdmissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        ApplicationStatus currentStatus = application.getStatus();

        // Enforce Workflow Rules
        switch (targetStatus) {
            case UNDER_REVIEW:
                if (currentStatus != ApplicationStatus.SUBMITTED) {
                    throw new BusinessException("Only submitted applications can go under review");
                }
                break;
            case ADMITTED:
                if (currentStatus != ApplicationStatus.UNDER_REVIEW && currentStatus != ApplicationStatus.WAITLISTED) {
                    throw new BusinessException("Application must be under review or waitlisted before admission");
                }
                break;
            case REJECTED:
                // Can be rejected at almost any time, but typically from UNDER_REVIEW
                break;
            default:
                throw new BusinessException("Invalid workflow transition from " + currentStatus + " to " + targetStatus);
        }

        application.setStatus(targetStatus);
        return applicationRepository.save(application);
    }
}
