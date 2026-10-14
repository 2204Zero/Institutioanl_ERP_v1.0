package com.erp.admission.applicant.repository;

import com.erp.admission.applicant.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Applicant> findByPhone(String phone);
    boolean existsByPhone(String phone);
    java.util.List<Applicant> findAllByOrderByCreatedAtDescIdDesc();
}
