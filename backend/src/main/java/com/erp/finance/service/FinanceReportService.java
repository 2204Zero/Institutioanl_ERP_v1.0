package com.erp.finance.service;

import com.erp.finance.payment.repository.PaymentRepository;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class FinanceReportService {
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;

    public FinanceReportService(PaymentRepository paymentRepository, StudentFeeRepository studentFeeRepository) {
        this.paymentRepository = paymentRepository;
        this.studentFeeRepository = studentFeeRepository;
    }

    public Map<String, Object> getFinancialSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal totalGross = studentFeeRepository.findAll().stream()
                .map(f -> f.getGrossAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalCollected = paymentRepository.findAll().stream()
                .map(p -> p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalOutstanding = studentFeeRepository.findAll().stream()
                .map(f -> f.getOutstandingAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        summary.put("totalGrossAssigned", totalGross);
        summary.put("totalCollected", totalCollected);
        summary.put("totalOutstanding", totalOutstanding);
        
        return summary;
    }
}
