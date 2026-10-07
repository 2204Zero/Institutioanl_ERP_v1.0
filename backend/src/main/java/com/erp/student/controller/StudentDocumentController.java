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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Tag(name = "Student Documents", description = "APIs for uploading, downloading, viewing, and deleting student documents (Day 04)")
public class StudentDocumentController {

    private final StudentDocumentService documentService;

    public StudentDocumentController(StudentDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/api/v1/students/{studentId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
    @Operation(summary = "List Student Documents", description = "Retrieves metadata of all uploaded documents for a student")
    public ResponseEntity<ApiResponse<List<StudentDocumentResponseDto>>> getDocumentsByStudent(@PathVariable Long studentId) {
        List<StudentDocumentResponseDto> documents = documentService.getDocumentsByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/api/v1/documents/{id}/metadata")
    @Operation(summary = "Get Document Metadata", description = "Retrieves document metadata by ID")
    public ResponseEntity<ApiResponse<StudentDocumentResponseDto>> getDocumentMetadata(@PathVariable Long id) {
        StudentDocumentResponseDto metadata = documentService.getDocumentMetadata(id);
        return ResponseEntity.ok(ApiResponse.success(metadata));
    }

    @GetMapping("/api/v1/documents/{id}/download")
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
    @Operation(summary = "Delete Document", description = "Deletes document record and underlying disk file")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
