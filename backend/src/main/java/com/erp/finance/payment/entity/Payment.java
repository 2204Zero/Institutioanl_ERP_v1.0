package com.erp.finance.payment.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.student_fee.entity.StudentFee;
@Entity
@Table(name = "finance_payment")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String referenceNumber;
    @Column(name="student_id", nullable = false) private Long studentId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_fee_id", nullable = false) private StudentFee studentFee;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(nullable = false) private LocalDate paymentDate;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PaymentMethod paymentMethod;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PaymentStatus status = PaymentStatus.PENDING;
    private String remarks;
    private String createdBy;
    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;
    @Column(name = "request_hash")
    private String requestHash;
    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentAllocation> allocations = new ArrayList<>();
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getReferenceNumber() { return referenceNumber; } public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long studentId) { this.studentId = studentId; }
    public StudentFee getStudentFee() { return studentFee; } public void setStudentFee(StudentFee studentFee) { this.studentFee = studentFee; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getPaymentDate() { return paymentDate; } public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; } public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public PaymentStatus getStatus() { return status; } public void setStatus(PaymentStatus status) { this.status = status; }
    public String getRemarks() { return remarks; } public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getCreatedBy() { return createdBy; } public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getIdempotencyKey() { return idempotencyKey; } public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public String getRequestHash() { return requestHash; } public void setRequestHash(String requestHash) { this.requestHash = requestHash; }
    public List<PaymentAllocation> getAllocations() { return allocations; } public void setAllocations(List<PaymentAllocation> allocations) { this.allocations = allocations; }
}
