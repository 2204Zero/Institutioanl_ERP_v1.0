package com.erp.finance.scholarship.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import com.erp.finance.enums.ConcessionStatus;
import com.erp.finance.fee_structure.entity.FeeHead;
@Entity
@Table(name = "finance_concession")
public class Concession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name="student_id", nullable = false) private Long studentId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fee_head_id", nullable = false) private FeeHead feeHead;
    @Column(nullable = false) private String type; // FIXED, PERCENTAGE
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal value;
    private String reason;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ConcessionStatus status = ConcessionStatus.PENDING;
    private String approvedBy;
    private Instant approvedAt;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long studentId) { this.studentId = studentId; }
    public FeeHead getFeeHead() { return feeHead; } public void setFeeHead(FeeHead feeHead) { this.feeHead = feeHead; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public BigDecimal getValue() { return value; } public void setValue(BigDecimal value) { this.value = value; }
    public String getReason() { return reason; } public void setReason(String reason) { this.reason = reason; }
    public ConcessionStatus getStatus() { return status; } public void setStatus(ConcessionStatus status) { this.status = status; }
    public String getApprovedBy() { return approvedBy; } public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public Instant getApprovedAt() { return approvedAt; } public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
}
