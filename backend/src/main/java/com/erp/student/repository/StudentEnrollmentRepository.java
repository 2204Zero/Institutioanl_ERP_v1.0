package com.erp.student.repository;

import com.erp.student.entity.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, Long> {
    Optional<StudentEnrollment> findByEnrollmentNumber(String enrollmentNumber);
    List<StudentEnrollment> findByStudentId(Long studentId);
}
