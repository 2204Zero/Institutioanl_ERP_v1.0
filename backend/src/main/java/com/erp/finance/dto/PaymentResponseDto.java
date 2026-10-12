package com.erp.finance.dto;

import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.payment.entity.Payment;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentResponseDto {
    private Long id;
    private String referenceNumber;
    private Long studentId;
    private Long studentFeeId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String remarks;
    private String createdBy;

    public PaymentResponseDto() {}

    public static PaymentResponseDto fromEntity(Payment payment) {
        if (payment == null) return null;
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setId(payment.getId());
        dto.setReferenceNumber(payment.getReferenceNumber());
        dto.setStudentId(payment.getStudentId());
        if (payment.getStudentFee() != null) {
            dto.setStudentFeeId(payment.getStudentFee().getId());
        }
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus());
        dto.setRemarks(payment.getRemarks());
        dto.setCreatedBy(payment.getCreatedBy());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getStudentFeeId() { return studentFeeId; }
    public void setStudentFeeId(Long studentFeeId) { this.studentFeeId = studentFeeId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
