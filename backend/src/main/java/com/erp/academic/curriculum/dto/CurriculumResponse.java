package com.erp.academic.curriculum.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CurriculumResponse {
    private Long id;
    private String version;
    private Long programId;
    private Long semesterId;
    private Long effectiveAcademicYearId;
    private Integer totalCredits;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}
