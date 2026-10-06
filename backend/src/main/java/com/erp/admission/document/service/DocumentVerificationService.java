package com.erp.admission.document.service;

import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.document.dto.DocumentUploadRequest;
import com.erp.admission.document.entity.ApplicantDocument;
import com.erp.admission.document.repository.ApplicantDocumentRepository;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentVerificationService {

    private final ApplicantDocumentRepository documentRepository;
    private final ApplicantRepository applicantRepository;

    @Transactional
    public ApplicantDocument uploadDocument(DocumentUploadRequest request) {
        Applicant applicant = applicantRepository.findById(request.getApplicantId())
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        ApplicantDocument document = ApplicantDocument.builder()
                .applicant(applicant)
                .documentType(request.getDocumentType())
                .fileUrl(request.getFileUrl())
                .verificationStatus("PENDING")
                .build();

        return documentRepository.save(document);
    }

    @Transactional
    public ApplicantDocument verifyDocument(Long documentId, String status, String remarks) {
        ApplicantDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        document.setVerificationStatus(status);
        document.setRemarks(remarks);
        document.setVerifiedAt(Instant.now());

        return documentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public List<ApplicantDocument> getApplicantDocuments(Long applicantId) {
        return documentRepository.findByApplicantId(applicantId);
    }
}
