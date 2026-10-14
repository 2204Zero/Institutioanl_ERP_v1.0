package com.erp.admission.document.repository;

import com.erp.admission.document.entity.ApplicantDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicantDocumentRepository extends JpaRepository<ApplicantDocument, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT d FROM ApplicantDocument d WHERE d.applicant.id = :applicantId")
    List<ApplicantDocument> findByApplicantId(@org.springframework.data.repository.query.Param("applicantId") Long applicantId);
}
