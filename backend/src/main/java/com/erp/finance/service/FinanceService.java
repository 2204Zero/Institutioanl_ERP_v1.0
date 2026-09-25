package com.erp.finance.service;

import com.erp.finance.dto.FeeCreationRequest;
import com.erp.finance.dto.FeeRecordResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class FinanceService {

    private final Map<Long, FeeRecordResponse> feeStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(2000);

    public FinanceService() {
        feeStore.put(2001L, new FeeRecordResponse(
                2001L, 101L, "Semester 5", new BigDecimal("75000.00"),
                new BigDecimal("75000.00"), BigDecimal.ZERO, "PAID", LocalDate.now().minusMonths(1)
        ));
        feeStore.put(2002L, new FeeRecordResponse(
                2002L, 102L, "Semester 5", new BigDecimal("75000.00"),
                new BigDecimal("50000.00"), new BigDecimal("25000.00"), "PARTIAL", LocalDate.now().plusDays(15)
        ));
    }

    public FeeRecordResponse createFeeInvoice(FeeCreationRequest request) {
        long id = idGenerator.incrementAndGet();
        FeeRecordResponse record = new FeeRecordResponse(
                id,
                request.studentId(),
                request.semester(),
                request.amount(),
                BigDecimal.ZERO,
                request.amount(),
                "PENDING",
                request.dueDate()
        );
        feeStore.put(id, record);
        return record;
    }

    public List<FeeRecordResponse> getFeesByStudent(Long studentId) {
        return feeStore.values().stream()
                .filter(f -> f.studentId().equals(studentId))
                .toList();
    }

    public List<FeeRecordResponse> getAllFees() {
        return new ArrayList<>(feeStore.values());
    }
}

