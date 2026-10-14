package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FinanceJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeHeadRecord {
        private Long id;
        private String name;
        private String code;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeStructureComponentItem {
        private Long feeHeadId;
        private String feeHeadName;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeStructureRecord {
        private Long id;
        private String name;
        private Long academicYearId;
        private Boolean active;
        @Builder.Default
        private List<FeeStructureComponentItem> components = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentFeeComponentItem {
        private Long feeHeadId;
        private String feeHeadName;
        private BigDecimal grossAmount;
        private BigDecimal outstandingAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentFeeRecord {
        private Long id;
        private Long studentId;
        private Long academicYearId;
        private Long feeStructureId;
        private BigDecimal grossAmount;
        private BigDecimal netPayable;
        private BigDecimal outstandingAmount;
        private String status; // PENDING, PARTIAL, PAID, CANCELLED
        @Builder.Default
        private List<StudentFeeComponentItem> components = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRecord {
        private Long id;
        private Long studentFeeId;
        private BigDecimal amount;
        private LocalDate paymentDate;
        private String paymentMethod; // CASH, CARD, UPI, NET_BANKING
        private String referenceNumber;
        private String status; // SUCCESS, PENDING, FAILED
        private String idempotencyKey;
        private String requestHash;
        private String remarks;
        private String createdBy;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptRecord {
        private Long id;
        private String receiptNumber;
        private Long paymentId;
        private Long studentFeeId;
        private BigDecimal amount;
        private LocalDate receiptDate;
        private String issuedBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinanceSummaryRecord {
        private BigDecimal totalGrossAssigned;
        private BigDecimal totalCollected;
        private BigDecimal totalOutstanding;
    }
}
