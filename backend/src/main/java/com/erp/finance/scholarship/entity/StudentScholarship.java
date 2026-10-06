package com.erp.finance.scholarship.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import com.erp.finance.enums.ConcessionStatus;
@Entity
@Table(name = "finance_student_scholarship")
public class StudentScholarship {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name="student_id", nullable = false) private Long studentId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "scholarship_id", nullable = false) private Scholarship scholarship;
    @Column(name="academic_year_id", nullable = false) private Long academicYearId;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ConcessionStatus status = ConcessionStatus.PENDING;
    private String approvedBy;
    private Instant approvedAt;
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; } public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Scholarship getScholarship() { return scholarship; } public void setScholarship(Scholarship scholarship) { this.scholarship = scholarship; }
    public Long getAcademicYearId() { return academicYearId; } public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
    public ConcessionStatus getStatus() { return status; } public void setStatus(ConcessionStatus status) { this.status = status; }
    public String getApprovedBy() { return approvedBy; } public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public Instant getApprovedAt() { return approvedAt; } public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
}
