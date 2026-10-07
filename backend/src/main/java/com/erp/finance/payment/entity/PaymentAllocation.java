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
