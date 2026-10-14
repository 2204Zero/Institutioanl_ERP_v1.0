package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

public class AdmissionJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicantRecord {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String address;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdmissionApplicationRecord {
        private Long id;
        private String applicationNumber;
        private Long applicantId;
        private Long programId;
        private Long academicYearId;
        private String status; // DRAFT, SUBMITTED, UNDER_REVIEW, ADMITTED, REJECTED
        private Double meritScore;
        private String reviewerRemarks;
        private Instant submittedAt;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApplicantDocumentRecord {
        private Long id;
        private Long applicantId;
        private String documentType;
        private String fileUrl;
        @Builder.Default
        private String verificationStatus = "PENDING";
        private String remarks;
        @Builder.Default
        private Instant uploadedAt = Instant.now();
        private Instant verifiedAt;
    }
}
