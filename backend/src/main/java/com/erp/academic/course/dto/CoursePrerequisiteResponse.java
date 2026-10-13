package com.erp.academic.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursePrerequisiteResponse {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long prerequisiteCourseId;
    private String prerequisiteCourseCode;
    private String prerequisiteCourseName;
}
