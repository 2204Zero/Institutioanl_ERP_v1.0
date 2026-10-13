package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

public class RegistrationJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRegistrationRecord {
        private Long id;
        private Long studentId;
        private Long courseOfferingId;
        private Long sectionId;
        private LocalDate registrationDate;
        private String status; // REGISTERED, DROPPED, COMPLETED
        private String grade;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionStudentRecord {
        private Long id;
        private Long sectionId;
        private Long studentId;
        private Boolean isActive;
    }
}
