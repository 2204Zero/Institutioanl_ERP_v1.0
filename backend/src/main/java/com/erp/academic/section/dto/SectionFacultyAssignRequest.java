package com.erp.academic.section.dto;

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
public class SectionFacultyAssignRequest {

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    private Long subjectId;

    @NotBlank(message = "Role is required (e.g. CLASS_TEACHER, SUBJECT_TEACHER, LAB_INSTRUCTOR)")
    private String role;
}
