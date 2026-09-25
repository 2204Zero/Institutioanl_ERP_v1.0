package com.erp.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FeeCreationRequest(
        @NotNull(message = "Student ID is required")
        Long studentId,

        @NotBlank(message = "Semester is required")
        String semester,

        @NotNull(message = "Total fee amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Fee amount must be greater than 0")
        BigDecimal amount,

        @NotNull(message = "Due date is required")
        LocalDate dueDate
) {}

