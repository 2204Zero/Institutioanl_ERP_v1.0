package com.erp.academic.curriculum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumCourseResponse {
    private Long id;
    private Long curriculumId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String classification;
    private Integer credits;
    private Instant createdAt;
}
