package com.erp.finance.payment.repository;

import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStudentId(Long studentId);
    @Query("SELECT p FROM Payment p WHERE p.studentFee.id = :studentFeeId")
    List<Payment> findByStudentFeeId(@Param("studentFeeId") Long studentFeeId);
    Optional<Payment> findByReferenceNumber(String referenceNumber);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);
}
