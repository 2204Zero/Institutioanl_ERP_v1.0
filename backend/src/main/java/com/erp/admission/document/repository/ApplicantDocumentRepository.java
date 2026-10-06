package com.erp.admission.document.repository;

import com.erp.admission.document.entity.ApplicantDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicantDocumentRepository extends JpaRepository<ApplicantDocument, Long> {
    List<ApplicantDocument> findByApplicantId(Long applicantId);
}
