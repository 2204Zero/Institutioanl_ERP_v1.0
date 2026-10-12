package com.erp.finance.service;

import com.erp.finance.dto.FinanceSummaryResponseDto;
import com.erp.finance.enums.PaymentStatus;
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
        FinanceSummaryResponseDto summaryDto = getFinancialSummaryDto();
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalGrossAssigned", summaryDto.getTotalGrossAssigned());
        summary.put("totalCollected", summaryDto.getTotalCollected());
        summary.put("totalOutstanding", summaryDto.getTotalOutstanding());
        return summary;
    }

    public FinanceSummaryResponseDto getFinancialSummaryDto() {
        BigDecimal totalGross = studentFeeRepository.sumGrossAmount();
        BigDecimal totalCollected = paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS);
        BigDecimal totalOutstanding = studentFeeRepository.sumOutstandingAmount();

        return new FinanceSummaryResponseDto(
                totalGross != null ? totalGross : BigDecimal.ZERO,
                totalCollected != null ? totalCollected : BigDecimal.ZERO,
                totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO
        );
    }
}
