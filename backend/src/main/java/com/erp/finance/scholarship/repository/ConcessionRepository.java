package com.erp.finance.scholarship.repository;
import com.erp.finance.scholarship.entity.Concession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ConcessionRepository extends JpaRepository<Concession, Long> {}
