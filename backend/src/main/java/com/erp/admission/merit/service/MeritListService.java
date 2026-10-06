package com.erp.admission.merit.service;

import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeritListService {

    private final AdmissionApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public List<AdmissionApplication> generateMeritList(Long programId, Long academicYearId) {
        List<AdmissionApplication> applications = applicationRepository
                .findByProgramIdAndAcademicYearId(programId, academicYearId);

        // Filter only UNDER_REVIEW or DOCUMENT_VERIFICATION_PENDING, sort by merit score descending
        return applications.stream()
                .filter(app -> app.getStatus() == ApplicationStatus.UNDER_REVIEW 
                            || app.getStatus() == ApplicationStatus.SUBMITTED)
                .filter(app -> app.getMeritScore() != null)
                .sorted(Comparator.comparing(AdmissionApplication::getMeritScore).reversed())
                .collect(Collectors.toList());
    }
}
