package com.erp.finance.fee_structure.repository;
import com.erp.finance.fee_structure.entity.FeeHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface FeeHeadRepository extends JpaRepository<FeeHead, Long> {
    Optional<FeeHead> findByCode(String code);
}
