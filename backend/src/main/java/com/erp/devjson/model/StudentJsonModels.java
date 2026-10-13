package com.erp.devjson.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class StudentJsonModels {

    private StudentJsonModels() {}

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StudentRecord {
        private Long id;
        private String rollNumber;
        private String enrollmentNumber;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String department;
        private String program;
        private String batch;
        private LocalDate enrollmentDate;
        private String status; // ACTIVE, INACTIVE, SUSPENDED, GRADUATED, ALUMNI, DROPPED, TRANSFERRED
        private Long userId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StudentStatusHistoryRecord {
        private Long id;
        private Long studentId;
        private String previousStatus;
        private String newStatus;
        private String reason;
        private String changedBy;
        private LocalDate effectiveDate;
        private LocalDateTime changedAt;
    }
}
