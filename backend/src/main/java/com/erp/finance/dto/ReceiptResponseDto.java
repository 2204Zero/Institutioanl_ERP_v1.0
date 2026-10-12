package com.erp.finance.dto;

import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.invoice.entity.Receipt;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class ReceiptResponseDto {
    private Long id;
    private String receiptNumber;
    private Long paymentId;
    private String referenceNumber;
    private Long studentId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private Instant generatedAt;

    public ReceiptResponseDto() {}

    public static ReceiptResponseDto fromEntity(Receipt receipt) {
        if (receipt == null) return null;
        ReceiptResponseDto dto = new ReceiptResponseDto();
        dto.setId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        if (receipt.getPayment() != null) {
            dto.setPaymentId(receipt.getPayment().getId());
            dto.setReferenceNumber(receipt.getPayment().getReferenceNumber());
            dto.setAmount(receipt.getPayment().getAmount());
            dto.setPaymentDate(receipt.getPayment().getPaymentDate());
            dto.setPaymentMethod(receipt.getPayment().getPaymentMethod());
        }
        dto.setStudentId(receipt.getStudentId());
        dto.setStatus(receipt.getStatus());
        dto.setGeneratedAt(receipt.getGeneratedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
}
