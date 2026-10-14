package com.erp.admission.inquiry.repository;

import com.erp.admission.inquiry.entity.AdmissionInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionInquiryRepository extends JpaRepository<AdmissionInquiry, Long> {
    List<AdmissionInquiry> findByEmailIgnoreCase(String email);
    List<AdmissionInquiry> findByPhone(String phone);
}
