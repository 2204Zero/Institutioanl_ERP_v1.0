package com.erp.finance.fee_structure.repository;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface FeeStructureComponentRepository extends JpaRepository<FeeStructureComponent, Long> {
}
