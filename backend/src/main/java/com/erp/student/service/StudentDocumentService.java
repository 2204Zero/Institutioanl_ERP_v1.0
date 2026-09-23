package com.erp.student.service;

import com.erp.student.dto.StudentDocumentResponseDto;
import com.erp.student.entity.DocumentType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentDocumentService {

    StudentDocumentResponseDto uploadDocument(Long studentId, DocumentType documentType, MultipartFile file);

    List<StudentDocumentResponseDto> getDocumentsByStudentId(Long studentId);

    StudentDocumentResponseDto getDocumentMetadata(Long documentId);

    Resource loadDocumentAsResource(Long documentId);

    String getDocumentContentType(Long documentId);

    void deleteDocument(Long documentId);
}
