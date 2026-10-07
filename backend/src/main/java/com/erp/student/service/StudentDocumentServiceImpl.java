package com.erp.student.service;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.student.dto.StudentDocumentResponseDto;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentDocument;
import com.erp.student.mapper.StudentMapper;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentDocumentServiceImpl implements StudentDocumentService {

    private final StudentDocumentRepository documentRepository;
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final Path storageLocation;

    public StudentDocumentServiceImpl(StudentDocumentRepository documentRepository,
                                     StudentRepository studentRepository,
                                     StudentMapper studentMapper,
                                     @Value("${app.storage.document-dir:uploads/documents}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException ex) {
            throw new BusinessException("Could not initialize storage directory: " + ex.getMessage());
        }
    }

    @Override
    public StudentDocumentResponseDto uploadDocument(Long studentId, DocumentType documentType, MultipartFile file) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (file.isEmpty()) {
            throw new BusinessException("Cannot upload empty file.");
        }

        String rawOriginalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (rawOriginalFilename.contains("..")) {
            throw new BusinessException("Filename contains invalid path sequence: " + rawOriginalFilename);
        }

        // Extract extension
        String extension = "";
        int i = rawOriginalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = rawOriginalFilename.substring(i);
        }

        String storedFileName = studentId + "_" + documentType.name() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetLocation = this.storageLocation.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException("Failed to store file " + storedFileName + ": " + ex.getMessage());
        }

        // If a document of this type already exists for student, we can replace or add new version
        StudentDocument document = documentRepository.findByStudentIdAndDocumentType(studentId, documentType)
                .orElse(new StudentDocument());

        document.setStudent(student);
        document.setDocumentType(documentType);
        document.setFileName(storedFileName);
        document.setOriginalFileName(rawOriginalFilename);
        document.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        document.setFileSize(file.getSize());
        document.setStoragePath(targetLocation.toString());

        StudentDocument savedDocument = documentRepository.save(document);
        return studentMapper.toDocumentDto(savedDocument);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentDocumentResponseDto> getDocumentsByStudentId(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return documentRepository.findByStudentId(studentId).stream()
                .map(studentMapper::toDocumentDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDocumentResponseDto getDocumentMetadata(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return studentMapper.toDocumentDto(document);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadDocumentAsResource(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        try {
            Path filePath = Paths.get(document.getStoragePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server disk for document ID: " + documentId);
            }
        } catch (MalformedURLException ex) {
            throw new BusinessException("Invalid file path format: " + ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getDocumentContentType(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return document.getFileType();
    }

    @Override
    public void deleteDocument(Long documentId) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        try {
            Path filePath = Paths.get(document.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Logged if needed, proceed with DB record deletion
        }

        documentRepository.delete(document);
    }
}
