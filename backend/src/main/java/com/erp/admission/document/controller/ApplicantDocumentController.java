package com.erp.admission.document.controller;

import com.erp.admission.document.dto.DocumentUploadRequest;
import com.erp.admission.document.entity.ApplicantDocument;
import com.erp.admission.document.service.DocumentVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applicant-documents")
@RequiredArgsConstructor
public class ApplicantDocumentController {

    private final DocumentVerificationService documentService;

    @PostMapping("/upload")
    public ResponseEntity<ApplicantDocument> uploadDocument(@RequestBody DocumentUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.uploadDocument(request));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApplicantDocument> verifyDocument(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(documentService.verifyDocument(id, status, remarks));
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<ApplicantDocument>> getApplicantDocuments(@PathVariable Long applicantId) {
        return ResponseEntity.ok(documentService.getApplicantDocuments(applicantId));
    }
}
