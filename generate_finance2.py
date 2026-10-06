import os
base_dir = "backend/src/main/java/com/erp/finance"
def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

write_file("enums/ConcessionStatus.java", '''
package com.erp.finance.enums;
public enum ConcessionStatus { PENDING, APPROVED, REJECTED, REVOKED }
''')

scholarship = '''
package com.erp.finance.scholarship.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity
@Table(name = "finance_scholarship")
public class Scholarship {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String type; // FIXED, PERCENTAGE
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal value;
    private String eligibility;
    private Boolean active = true;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public BigDecimal getValue() { return value; } public void setValue(BigDecimal value) { this.value = value; }
    public String getEligibility() { return eligibility; } public void setEligibility(String eligibility) { this.eligibility = eligibility; }
    public Boolean getActive() { return active; } public void setActive(Boolean active) { this.active = active; }
}
'''
write_file("scholarship/entity/Scholarship.java", scholarship)

student_scholarship = '''
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
'''
write_file("scholarship/entity/StudentScholarship.java", student_scholarship)

concession = '''
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
'''
write_file("scholarship/entity/Concession.java", concession)

receipt = '''
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
'''
write_file("invoice/entity/Receipt.java", receipt)

print("Scholarship, Concession, Receipt generated.")
