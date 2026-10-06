import os
base_dir = "backend/src/main/java/com/erp/finance/service"
def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

write_file("PaymentService.java", '''
package com.erp.finance.service;

import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.invoice.repository.ReceiptRepository;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.payment.entity.PaymentAllocation;
import com.erp.finance.payment.repository.PaymentRepository;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final ReceiptRepository receiptRepository;

    public PaymentService(PaymentRepository paymentRepository, 
                          StudentFeeRepository studentFeeRepository, 
                          ReceiptRepository receiptRepository) {
        this.paymentRepository = paymentRepository;
        this.studentFeeRepository = studentFeeRepository;
        this.receiptRepository = receiptRepository;
    }

    @Transactional
    public Receipt recordPayment(Payment paymentDto, Long studentFeeId) {
        // 1. Validate student fee
        StudentFee studentFee = studentFeeRepository.findById(studentFeeId)
                .orElseThrow(() -> new RuntimeException("Student Fee not found"));

        if (studentFee.getStatus() == StudentFeeStatus.PAID || studentFee.getStatus() == StudentFeeStatus.CANCELLED) {
            throw new RuntimeException("Fee is already paid or cancelled");
        }

        // 2. Validate amount
        BigDecimal paymentAmount = paymentDto.getAmount();
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than 0");
        }
        if (paymentAmount.compareTo(studentFee.getOutstandingAmount()) > 0) {
            throw new RuntimeException("Payment exceeds outstanding amount");
        }

        // 3. Create Payment
        Payment payment = new Payment();
        payment.setStudentId(studentFee.getStudentId());
        payment.setStudentFee(studentFee);
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(paymentDto.getPaymentDate());
        payment.setPaymentMethod(paymentDto.getPaymentMethod());
        payment.setReferenceNumber(paymentDto.getReferenceNumber() != null ? paymentDto.getReferenceNumber() : UUID.randomUUID().toString());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setCreatedBy("ADMIN"); // Should come from SecurityContext

        // 4. Allocate Payment across components
        BigDecimal remainingAmount = paymentAmount;
        for (StudentFeeComponent component : studentFee.getComponents()) {
            if (remainingAmount.compareTo(BigDecimal.ZERO) == 0) break;
            
            BigDecimal componentOutstanding = component.getOutstandingAmount();
            if (componentOutstanding.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal allocateAmount = remainingAmount.min(componentOutstanding);
                
                PaymentAllocation allocation = new PaymentAllocation();
                allocation.setPayment(payment);
                allocation.setStudentFeeComponent(component);
                allocation.setAllocatedAmount(allocateAmount);
                payment.getAllocations().add(allocation);

                // Update component state
                component.setPaidAmount(component.getPaidAmount().add(allocateAmount));
                component.setOutstandingAmount(component.getOutstandingAmount().subtract(allocateAmount));
                
                remainingAmount = remainingAmount.subtract(allocateAmount);
            }
        }

        paymentRepository.save(payment);

        // 5. Update financial state of StudentFee
        studentFee.setPaidAmount(studentFee.getPaidAmount().add(paymentAmount));
        studentFee.setOutstandingAmount(studentFee.getNetPayable().subtract(studentFee.getPaidAmount()));
        
        if (studentFee.getOutstandingAmount().compareTo(BigDecimal.ZERO) == 0) {
            studentFee.setStatus(StudentFeeStatus.PAID);
        } else {
            studentFee.setStatus(StudentFeeStatus.PARTIALLY_PAID);
        }
        
        studentFeeRepository.save(studentFee);

        // 6. Generate Receipt
        Receipt receipt = new Receipt();
        receipt.setReceiptNumber("REC-" + Instant.now().toEpochMilli());
        receipt.setPayment(payment);
        receipt.setStudentId(studentFee.getStudentId());
        receipt.setStatus(PaymentStatus.SUCCESS);
        
        return receiptRepository.save(receipt);
        
        // 7. Audit (Handled by AOP or Event Listener in real system)
    }
}
''')

print("PaymentService generated.")
