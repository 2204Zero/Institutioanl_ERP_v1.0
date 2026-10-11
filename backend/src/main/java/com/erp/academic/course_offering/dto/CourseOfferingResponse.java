package com.erp.academic.course_offering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseOfferingResponse {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long semesterId;
    private String semesterName;
    private Integer maxCapacity;
    private Boolean isPublished;

    private CourseSummary course;
    private SemesterSummary semester;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseSummary {
        private Long id;
        private String code;
        private String name;
        private Integer credits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemesterSummary {
        private Long id;
        private String name;
        private Integer semesterNumber;
        private Boolean isActive;
    }
}
