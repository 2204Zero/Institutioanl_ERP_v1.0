package com.erp.finance.student_fee.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import com.erp.finance.fee_structure.entity.FeeHead;
@Entity
@Table(name = "student_fee_component")
public class StudentFeeComponent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_fee_id", nullable = false) private StudentFee studentFee;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fee_head_id", nullable = false) private FeeHead feeHead;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal grossAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal paidAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal outstandingAmount = BigDecimal.ZERO;
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public StudentFee getStudentFee() { return studentFee; } public void setStudentFee(StudentFee studentFee) { this.studentFee = studentFee; }
    public FeeHead getFeeHead() { return feeHead; } public void setFeeHead(FeeHead feeHead) { this.feeHead = feeHead; }
    public BigDecimal getGrossAmount() { return grossAmount; } public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; } public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getOutstandingAmount() { return outstandingAmount; } public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }
}
