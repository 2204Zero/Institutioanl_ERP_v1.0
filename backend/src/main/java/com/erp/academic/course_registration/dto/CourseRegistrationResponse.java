package com.erp.academic.course_registration.dto;

import com.erp.academic.course_registration.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRegistrationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private Long courseOfferingId;
    private Long sectionId;
    private RegistrationStatus status;
    private Instant registeredAt;
    private Instant droppedAt;

    private CourseOfferingSummary courseOffering;
    private SectionSummary section;

    @JsonProperty("courseCode")
    public String getCourseCode() {
        if (courseOffering != null && courseOffering.getCourse() != null) {
            return courseOffering.getCourse().getCode();
        }
        return "CR-" + (courseOfferingId != null ? courseOfferingId : id);
    }

    @JsonProperty("courseName")
    public String getCourseName() {
        if (courseOffering != null && courseOffering.getCourse() != null) {
            return courseOffering.getCourse().getName();
        }
        return "Course Offering #" + (courseOfferingId != null ? courseOfferingId : id);
    }

    @JsonProperty("sectionName")
    public String getSectionName() {
        if (section != null) {
            return section.getName();
        }
        return null;
    }

    @JsonProperty("credits")
    public Integer getCredits() {
        if (courseOffering != null && courseOffering.getCourse() != null) {
            return courseOffering.getCourse().getCredits();
        }
        return null;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseOfferingSummary {
        private Long id;
        private Boolean isPublished;
        private CourseSummary course;
        private SemesterSummary semester;
    }

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
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionSummary {
        private Long id;
        private String name;
        private Integer capacity;
        private Integer currentEnrollment;
    }
}
