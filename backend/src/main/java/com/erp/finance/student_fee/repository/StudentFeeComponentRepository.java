package com.erp.finance.student_fee.repository;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface StudentFeeComponentRepository extends JpaRepository<StudentFeeComponent, Long> {
}
