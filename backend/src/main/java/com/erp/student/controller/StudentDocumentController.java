package com.erp.student.controller;

import com.erp.common.response.ApiResponse;
import com.erp.student.dto.StudentDocumentResponseDto;
import com.erp.student.entity.DocumentType;
import com.erp.student.service.StudentDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Tag(name = "Student Documents", description = "APIs for uploading, downloading, viewing, and deleting student documents (Day 04)")
public class StudentDocumentController {

    private final StudentDocumentService documentService;
    private final com.erp.student.service.StudentDocumentGenerationService documentGenerationService;

    public StudentDocumentController(StudentDocumentService documentService,
                                     com.erp.student.service.StudentDocumentGenerationService documentGenerationService) {
        this.documentService = documentService;
        this.documentGenerationService = documentGenerationService;
    }

    @PostMapping(value = "/api/v1/students/{studentId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Upload Student Document",
            description = "Uploads Aadhaar, Transfer Certificate, Migration, Marksheet, or Photograph")
    public ResponseEntity<ApiResponse<StudentDocumentResponseDto>> uploadDocument(
            @PathVariable Long studentId,
            @RequestParam("documentType") DocumentType documentType,
            @Parameter(description = "Document file binary", content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
            @RequestParam("file") MultipartFile file) {
        StudentDocumentResponseDto uploaded = documentService.uploadDocument(studentId, documentType, file);
        return new ResponseEntity<>(ApiResponse.success("Document uploaded successfully", uploaded), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/students/{studentId}/documents")
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    @Operation(summary = "List Student Documents", description = "Retrieves metadata of all uploaded documents for a student")
    public ResponseEntity<ApiResponse<List<StudentDocumentResponseDto>>> getDocumentsByStudent(@PathVariable Long studentId) {
        List<StudentDocumentResponseDto> documents = documentService.getDocumentsByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/api/v1/documents/{id}/metadata")
    @PreAuthorize("@securityOwnershipService.canAccessDocumentData(authentication, #id) or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    @Operation(summary = "Get Document Metadata", description = "Retrieves document metadata by ID")
    public ResponseEntity<ApiResponse<StudentDocumentResponseDto>> getDocumentMetadata(@PathVariable Long id) {
        StudentDocumentResponseDto metadata = documentService.getDocumentMetadata(id);
        return ResponseEntity.ok(ApiResponse.success(metadata));
    }

    @GetMapping("/api/v1/documents/{id}/download")
    @PreAuthorize("@securityOwnershipService.canAccessDocumentData(authentication, #id) or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    @Operation(summary = "Download Document", description = "Streams document file with Content-Disposition attachment header")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Resource resource = documentService.loadDocumentAsResource(id);
        StudentDocumentResponseDto metadata = documentService.getDocumentMetadata(id);
        String contentType = documentService.getDocumentContentType(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/api/v1/documents/{id}/view")
    @PreAuthorize("@securityOwnershipService.canAccessDocumentData(authentication, #id) or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    @Operation(summary = "View Document", description = "Streams document inline for browser previewing (PDF/Images)")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long id) {
        Resource resource = documentService.loadDocumentAsResource(id);
        StudentDocumentResponseDto metadata = documentService.getDocumentMetadata(id);
        String contentType = documentService.getDocumentContentType(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/api/v1/documents/{id}")
    @PreAuthorize("@securityOwnershipService.canDeleteDocument(authentication, #id) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete Document", description = "Deletes document record and underlying disk file")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    @GetMapping("/api/v1/students/{studentId}/id-card")
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Generate Student ID Card", description = "Generates official student ID card from persisted student and academic data")
    public ResponseEntity<ApiResponse<com.erp.student.dto.StudentIdCardDto>> getIdCard(@PathVariable Long studentId) {
        com.erp.student.dto.StudentIdCardDto idCard = documentGenerationService.generateIdCard(studentId);
        return ResponseEntity.ok(ApiResponse.success(idCard));
    }

    @GetMapping("/api/v1/students/{studentId}/transcript")
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Generate Academic Transcript", description = "Generates official academic transcript from persisted student course registration data")
    public ResponseEntity<ApiResponse<com.erp.student.dto.StudentTranscriptDto>> getTranscript(@PathVariable Long studentId) {
        com.erp.student.dto.StudentTranscriptDto transcript = documentGenerationService.generateTranscript(studentId);
        return ResponseEntity.ok(ApiResponse.success(transcript));
    }
}
