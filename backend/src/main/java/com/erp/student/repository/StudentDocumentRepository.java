package com.erp.student.repository;

import com.erp.student.entity.DocumentType;
import com.erp.student.entity.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {
    List<StudentDocument> findByStudentId(Long studentId);
    Optional<StudentDocument> findByStudentIdAndDocumentType(Long studentId, DocumentType documentType);
    boolean existsByStudentIdAndDocumentType(Long studentId, DocumentType documentType);
}
