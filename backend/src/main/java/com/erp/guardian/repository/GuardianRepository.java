package com.erp.guardian.repository;

import com.erp.guardian.entity.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    List<Guardian> findByStudentId(Long studentId);
    List<Guardian> findByPhone(String phone);
    List<Guardian> findByStudentIdAndIsEmergencyContactTrue(Long studentId);
}
