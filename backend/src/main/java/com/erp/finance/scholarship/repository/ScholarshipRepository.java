package com.erp.finance.scholarship.repository;
import com.erp.finance.scholarship.entity.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {}
