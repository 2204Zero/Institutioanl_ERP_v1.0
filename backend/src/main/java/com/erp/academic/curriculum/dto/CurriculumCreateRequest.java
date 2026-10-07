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
public class CurriculumCreateRequest {

    @NotBlank(message = "Curriculum version is required")
    private String version;

    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotNull(message = "Semester ID is required")
    private Long semesterId;

    @NotNull(message = "Effective academic year ID is required")
    private Long effectiveAcademicYearId;

    private Integer totalCredits;
    private Boolean isActive;
}
