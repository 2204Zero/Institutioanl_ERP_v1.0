package com.erp.admission.application.service;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.application.dto.AdmissionApplicationDto;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdmissionApplicationService {

    private final AdmissionApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;

    @Transactional
    public AdmissionApplicationDto createDraftApplication(Long applicantId, Long programId, Long academicYearId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found"));
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic Year not found"));

        AdmissionApplication application = AdmissionApplication.builder()
                .applicationNumber("APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .applicant(applicant)
                .program(program)
                .academicYear(academicYear)
                .status(ApplicationStatus.DRAFT)
                .build();

        AdmissionApplication saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    @Transactional
    public java.util.List<AdmissionApplicationDto> getAllApplications() { return applicationRepository.findAll().stream().map(this::mapToDto).toList(); }

    

    public AdmissionApplicationDto submitApplication(Long applicationId) {
        AdmissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getStatus() != ApplicationStatus.DRAFT) {
            throw new BusinessException("Only DRAFT applications can be submitted");
        }

        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setSubmittedAt(Instant.now());
        
        return mapToDto(applicationRepository.save(application));
    }

    @Transactional
    public AdmissionApplicationDto updateStatus(Long applicationId, ApplicationStatus newStatus, String remarks) {
        AdmissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Basic State Machine Rules
        if (application.getStatus() == ApplicationStatus.REJECTED && newStatus == ApplicationStatus.ADMITTED) {
            throw new BusinessException("Cannot directly admit a rejected application");
        }
        if (application.getStatus() == ApplicationStatus.DRAFT && newStatus == ApplicationStatus.ADMITTED) {
            throw new BusinessException("Draft applications must be submitted before admission");
        }

        application.setStatus(newStatus);
        application.setReviewerRemarks(remarks);

        return mapToDto(applicationRepository.save(application));
    }

    private AdmissionApplicationDto mapToDto(AdmissionApplication entity) {
        return AdmissionApplicationDto.builder()
                .id(entity.getId())
                .applicationNumber(entity.getApplicationNumber())
                .applicantId(entity.getApplicant().getId())
                .programId(entity.getProgram().getId())
                .academicYearId(entity.getAcademicYear().getId())
                .status(entity.getStatus())
                .meritScore(entity.getMeritScore())
                .submittedAt(entity.getSubmittedAt())
                .build();
    }
}




