package com.erp.finance.student_fee.repository;

import com.erp.finance.student_fee.entity.StudentFee;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    List<StudentFee> findByStudentId(Long studentId);
    Optional<StudentFee> findByStudentIdAndAcademicYearId(Long studentId, Long academicYearId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT sf FROM StudentFee sf WHERE sf.id = :id")
    Optional<StudentFee> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(sf.grossAmount), 0) FROM StudentFee sf")
    BigDecimal sumGrossAmount();

    @Query("SELECT COALESCE(SUM(sf.outstandingAmount), 0) FROM StudentFee sf")
    BigDecimal sumOutstandingAmount();
}
