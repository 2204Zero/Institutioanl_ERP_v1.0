package com.erp.finance.service;

import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.invoice.repository.ReceiptRepository;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.payment.repository.PaymentRepository;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private StudentFeeRepository studentFeeRepository;
    @Mock
    private ReceiptRepository receiptRepository;

    @InjectMocks
    private PaymentService paymentService;

    private StudentFee mockStudentFee;

    @BeforeEach
    void setUp() {
        mockStudentFee = new StudentFee();
        mockStudentFee.setId(1L);
        mockStudentFee.setGrossAmount(new BigDecimal("75000.00"));
        mockStudentFee.setScholarshipAmount(new BigDecimal("10000.00"));
        mockStudentFee.setConcessionAmount(new BigDecimal("5000.00"));
        mockStudentFee.setNetPayable(new BigDecimal("60000.00"));
        mockStudentFee.setOutstandingAmount(new BigDecimal("60000.00"));
        
        StudentFeeComponent comp1 = new StudentFeeComponent();
        comp1.setGrossAmount(new BigDecimal("60000.00"));
        comp1.setOutstandingAmount(new BigDecimal("60000.00"));
        mockStudentFee.getComponents().add(comp1);
    }

    @Test
    void testRecordPayment_Success() {
        when(studentFeeRepository.findById(1L)).thenReturn(Optional.of(mockStudentFee));
        when(receiptRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        Payment payment = new Payment();
        payment.setAmount(new BigDecimal("40000.00"));
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMethod(PaymentMethod.ONLINE);

        paymentService.recordPayment(payment, 1L);

        assertEquals(new BigDecimal("40000.00"), mockStudentFee.getPaidAmount());
        assertEquals(new BigDecimal("20000.00"), mockStudentFee.getOutstandingAmount());
        assertEquals(StudentFeeStatus.PARTIALLY_PAID, mockStudentFee.getStatus());
        
        verify(paymentRepository).save(any());
        verify(studentFeeRepository).save(any());
    }

    @Test
    void testRecordPayment_ExceedsOutstanding() {
        when(studentFeeRepository.findById(1L)).thenReturn(Optional.of(mockStudentFee));

        Payment payment = new Payment();
        payment.setAmount(new BigDecimal("70000.00")); // Exceeds 60000

        assertThrows(RuntimeException.class, () -> paymentService.recordPayment(payment, 1L));
    }
}
