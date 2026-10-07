package com.erp.student.repository;

import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByEmail(String email);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByEmail(String email);

    Page<Student> findByStatus(StudentStatus status, Pageable pageable);

    Page<Student> findByDepartmentIgnoreCase(String department, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           " LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:department IS NULL OR :department = '' OR LOWER(s.department) = LOWER(:department))")
    Page<Student> searchStudents(@Param("query") String query,
                                @Param("status") StudentStatus status,
                                @Param("department") String department,
                                Pageable pageable);
}
