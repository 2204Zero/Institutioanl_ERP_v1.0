package com.erp.finance.student_fee.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import com.erp.finance.enums.StudentFeeStatus;
@Entity
@Table(name = "student_fee", uniqueConstraints = {@UniqueConstraint(columnNames = {"student_id", "academic_year_id", "fee_structure_id"})})
public class StudentFee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name="student_id", nullable = false) private Long studentId;
    @Column(name="academic_year_id", nullable = false) private Long academicYearId;
    @Column(name="fee_structure_id", nullable = false) private Long feeStructureId;
    
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal grossAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal scholarshipAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal concessionAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal netPayable = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal paidAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal outstandingAmount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING) @Column(nullable = false) private StudentFeeStatus status = StudentFeeStatus.PENDING;
    @OneToMany(mappedBy = "studentFee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentFeeComponent> components = new ArrayList<>();
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    @Column(name="updated_at") private Instant updatedAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getAcademicYearId() { return academicYearId; } public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public Long getFeeStructureId() { return feeStructureId; } public void setFeeStructureId(Long feeStructureId) { this.feeStructureId = feeStructureId; }
    public BigDecimal getGrossAmount() { return grossAmount; } public void setGrossAmount(BigDecimal grossAmount) { this.grossAmount = grossAmount; }
    public BigDecimal getScholarshipAmount() { return scholarshipAmount; } public void setScholarshipAmount(BigDecimal scholarshipAmount) { this.scholarshipAmount = scholarshipAmount; }
    public BigDecimal getConcessionAmount() { return concessionAmount; } public void setConcessionAmount(BigDecimal concessionAmount) { this.concessionAmount = concessionAmount; }
    public BigDecimal getNetPayable() { return netPayable; } public void setNetPayable(BigDecimal netPayable) { this.netPayable = netPayable; }
    public BigDecimal getPaidAmount() { return paidAmount; } public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getOutstandingAmount() { return outstandingAmount; } public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }
    public StudentFeeStatus getStatus() { return status; } public void setStatus(StudentFeeStatus status) { this.status = status; }
    public List<StudentFeeComponent> getComponents() { return components; } public void setComponents(List<StudentFeeComponent> components) { this.components = components; }
}
