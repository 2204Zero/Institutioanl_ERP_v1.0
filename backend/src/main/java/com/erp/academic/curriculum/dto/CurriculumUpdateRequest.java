package com.erp.academic.curriculum.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CurriculumUpdateRequest {
    private String version;
    private Long programId;
    private Long semesterId;
    private Long effectiveAcademicYearId;
    private Integer totalCredits;
    private Boolean isActive;

}
