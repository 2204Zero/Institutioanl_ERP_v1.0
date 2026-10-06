package com.erp.admission.application.repository;

import com.erp.admission.application.entity.AdmissionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, Long> {
    Optional<AdmissionApplication> findByApplicationNumber(String applicationNumber);
    List<AdmissionApplication> findByApplicantId(Long applicantId);
    List<AdmissionApplication> findByProgramIdAndAcademicYearId(Long programId, Long academicYearId);
}
