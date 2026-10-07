package com.erp.finance.invoice.entity;
import jakarta.persistence.*;
import java.time.Instant;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.enums.PaymentStatus;
@Entity
@Table(name = "finance_receipt")
public class Receipt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String receiptNumber;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "payment_id", nullable = false, unique = true) private Payment payment;
    @Column(name="student_id", nullable = false) private Long studentId;
    @Column(nullable = false) private Instant generatedAt = Instant.now();
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PaymentStatus status;
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getReceiptNumber() { return receiptNumber; } public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
    public Payment getPayment() { return payment; } public void setPayment(Payment payment) { this.payment = payment; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Instant getGeneratedAt() { return generatedAt; } public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
    public PaymentStatus getStatus() { return status; } public void setStatus(PaymentStatus status) { this.status = status; }
}
