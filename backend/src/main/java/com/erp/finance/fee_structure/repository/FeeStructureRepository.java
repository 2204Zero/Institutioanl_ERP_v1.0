package com.erp.finance.fee_structure.repository;
import com.erp.finance.fee_structure.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    Optional<FeeStructure> findByCode(String code);
    Optional<FeeStructure> findByProgramIdAndAcademicYearIdAndActiveTrue(Long programId, Long academicYearId);
}
