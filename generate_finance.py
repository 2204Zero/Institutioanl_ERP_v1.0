import os

base_dir = "backend/src/main/java/com/erp/finance"
def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")
    print(f"Created {full_path}")

# ENUMS
write_file("enums/PaymentStatus.java", '''
package com.erp.finance.enums;
public enum PaymentStatus { PENDING, SUCCESS, FAILED, CANCELLED, REVERSED }
''')

write_file("enums/PaymentMethod.java", '''
package com.erp.finance.enums;
public enum PaymentMethod { CASH, BANK_TRANSFER, CARD, UPI, ONLINE, OTHER }
''')

write_file("enums/StudentFeeStatus.java", '''
package com.erp.finance.enums;
public enum StudentFeeStatus { PENDING, PARTIALLY_PAID, PAID, OVERDUE, WAIVED, CANCELLED }
''')

# ENTITIES
fee_head = '''
package com.erp.finance.fee_structure.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name = "fee_head")
public class FeeHead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false) private String name;
    private String description;
    private Boolean active = true;
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public Boolean getActive() { return active; } public void setActive(Boolean active) { this.active = active; }
}
'''
write_file("fee_structure/entity/FeeHead.java", fee_head)

fee_structure = '''
package com.erp.finance.fee_structure.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
@Entity
@Table(name = "fee_structure")
public class FeeStructure {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String code;
    @Column(nullable = false) private String name;
    private Long academicYearId;
    private Long programId;
    private Boolean active = true;
    @OneToMany(mappedBy = "feeStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeeStructureComponent> components = new ArrayList<>();
    @Column(name="created_at", updatable=false) private Instant createdAt = Instant.now();
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public Long getAcademicYearId() { return academicYearId; } public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }
    public Long getProgramId() { return programId; } public void setProgramId(Long programId) { this.programId = programId; }
    public Boolean getActive() { return active; } public void setActive(Boolean active) { this.active = active; }
    public List<FeeStructureComponent> getComponents() { return components; } public void setComponents(List<FeeStructureComponent> components) { this.components = components; }
}
'''
write_file("fee_structure/entity/FeeStructure.java", fee_structure)

fee_structure_comp = '''
package com.erp.finance.fee_structure.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity
@Table(name = "fee_structure_component", uniqueConstraints = {@UniqueConstraint(columnNames = {"fee_structure_id", "fee_head_id"})})
public class FeeStructureComponent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fee_structure_id", nullable = false) private FeeStructure feeStructure;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fee_head_id", nullable = false) private FeeHead feeHead;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public FeeStructure getFeeStructure() { return feeStructure; } public void setFeeStructure(FeeStructure feeStructure) { this.feeStructure = feeStructure; }
    public FeeHead getFeeHead() { return feeHead; } public void setFeeHead(FeeHead feeHead) { this.feeHead = feeHead; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
}
'''
write_file("fee_structure/entity/FeeStructureComponent.java", fee_structure_comp)

student_fee = '''
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
'''
write_file("student_fee/entity/StudentFee.java", student_fee)

student_fee_comp = '''
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
'''
write_file("student_fee/entity/StudentFeeComponent.java", student_fee_comp)

payment = '''
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
    public List<PaymentAllocation> getAllocations() { return allocations; } public void setAllocations(List<PaymentAllocation> allocations) { this.allocations = allocations; }
}
'''
write_file("payment/entity/Payment.java", payment)

payment_alloc = '''
package com.erp.finance.payment.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
@Entity
@Table(name = "finance_payment_allocation")
public class PaymentAllocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "payment_id", nullable = false) private Payment payment;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_fee_component_id", nullable = false) private StudentFeeComponent studentFeeComponent;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal allocatedAmount;
    // getters setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Payment getPayment() { return payment; } public void setPayment(Payment payment) { this.payment = payment; }
    public StudentFeeComponent getStudentFeeComponent() { return studentFeeComponent; } public void setStudentFeeComponent(StudentFeeComponent studentFeeComponent) { this.studentFeeComponent = studentFeeComponent; }
    public BigDecimal getAllocatedAmount() { return allocatedAmount; } public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }
}
'''
write_file("payment/entity/PaymentAllocation.java", payment_alloc)

print("Entities generated.")
