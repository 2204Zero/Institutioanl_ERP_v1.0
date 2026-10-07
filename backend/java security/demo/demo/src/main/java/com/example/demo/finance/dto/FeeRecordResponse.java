package com.example.demo.finance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FeeRecordResponse(
        Long id,
        Long studentId,
        String semester,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal dueAmount,
        String status,
        LocalDate dueDate
) {}
