package com.erp.academic.curriculum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumUpdateRequest {
    private String version;
    private Long programId;
    private Long semesterId;
    private Long effectiveAcademicYearId;
    private Integer totalCredits;
    private Boolean isActive;
}
