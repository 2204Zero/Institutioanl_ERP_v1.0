package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

public final class AcademicJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentRecord {
        private Long id;
        private String name;
        private String code;
        private Long campusId;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcademicYearRecord {
        private Long id;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        @Builder.Default
        private Boolean isActive = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramRecord {
        private Long id;
        private String code;
        private String name;
        private String degree;
        private Long departmentId;
        private Integer duration;
        @Builder.Default
        private Boolean isActive = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRecord {
        private Long id;
        private String code;
        private String name;
        private String courseType;
        private Integer credits;
        private Long departmentId;
        private Long programId;
        @Builder.Default
        private Boolean isActive = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoursePrerequisiteRecord {
        private Long id;
        private Long courseId;
        private Long prerequisiteCourseId;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchRecord {
        private Long id;
        private String name;
        private String code;
        private Long programId;
        private Integer admissionYear;
        private Integer graduationYear;
        private Long academicYearId;
        @Builder.Default
        private Boolean isActive = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemesterRecord {
        private Long id;
        private String name;
        private Integer semesterNumber;
        private Long academicYearId;
        private LocalDate startDate;
        private LocalDate endDate;
        @Builder.Default
        private Boolean isActive = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseOfferingRecord {
        private Long id;
        private Long courseId;
        private Long semesterId;
        private Integer maxCapacity;
        @Builder.Default
        private Boolean isPublished = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionRecord {
        private Long id;
        private String name;
        private Long courseOfferingId;
        private Integer capacity;
        @Builder.Default
        private Integer currentEnrollment = 0;
        @Builder.Default
        private Boolean isActive = true;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionFacultyRecord {
        private Long id;
        private Long sectionId;
        private Long facultyId;
        private Long subjectId;
        private String role;
        @Builder.Default
        private Instant assignedAt = Instant.now();
    }
}
