package com.erp.finance.scholarship.repository;
import com.erp.finance.scholarship.entity.StudentScholarship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface StudentScholarshipRepository extends JpaRepository<StudentScholarship, Long> {}
