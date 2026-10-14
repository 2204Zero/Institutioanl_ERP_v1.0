package com.erp.admission.document.service;

import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.document.dto.DocumentUploadRequest;
import com.erp.admission.document.entity.ApplicantDocument;
import com.erp.admission.document.repository.ApplicantDocumentRepository;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.erp.common.exception.BusinessException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentVerificationService {

    private final ApplicantDocumentRepository documentRepository;
    private final ApplicantRepository applicantRepository;
    private final Path storageLocation;

    public DocumentVerificationService(
            ApplicantDocumentRepository documentRepository,
            ApplicantRepository applicantRepository,
            @Value("${app.storage.document-dir:uploads/documents}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.applicantRepository = applicantRepository;
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException ex) {
            // storage initialization
        }
    }

    @Transactional
    public ApplicantDocument uploadDocumentFile(Long applicantId, String documentType, MultipartFile file) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Cannot upload empty file");
        }

        String rawOriginalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (rawOriginalFilename.contains("..")) {
            throw new BusinessException("Filename contains invalid path sequence: " + rawOriginalFilename);
        }

        String extension = "";
        int i = rawOriginalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = rawOriginalFilename.substring(i);
        }

        String storedFileName = "applicant_" + applicantId + "_" + documentType.replaceAll("[^a-zA-Z0-9_]", "_") + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetLocation = this.storageLocation.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException("Failed to store file " + storedFileName + ": " + ex.getMessage());
        }

        ApplicantDocument document = documentRepository.findByApplicantId(applicantId).stream()
                .filter(d -> d.getDocumentType().equalsIgnoreCase(documentType))
                .findFirst()
                .orElse(ApplicantDocument.builder().applicant(applicant).documentType(documentType).build());

        document.setApplicant(applicant);
        document.setDocumentType(documentType);
        document.setFileUrl("/api/v1/applicant-documents/file/" + storedFileName);
        document.setVerificationStatus("PENDING");
        document.setUploadedAt(Instant.now());

        return documentRepository.save(document);
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = this.storageLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new BusinessException("Invalid file path format: " + ex.getMessage());
        }
    }

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
        return documentRepository.findByApplicantId(applicantId).stream()
                .sorted(java.util.Comparator.comparing((ApplicantDocument d) -> d.getUploadedAt() != null ? d.getUploadedAt() : Instant.EPOCH)
                        .thenComparing(ApplicantDocument::getId, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
                        .reversed())
                .toList();
    }
}
