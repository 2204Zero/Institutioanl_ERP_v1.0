package com.erp.finance.student_fee.repository;
import com.erp.finance.student_fee.entity.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    List<StudentFee> findByStudentId(Long studentId);
    Optional<StudentFee> findByStudentIdAndAcademicYearId(Long studentId, Long academicYearId);
}
