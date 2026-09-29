package com.erp.academic.curriculum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumCourseAssignRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Classification is required (e.g. MANDATORY, ELECTIVE)")
    private String classification;

    private Integer credits; // Optional override; defaults to Course master credits if null
}
