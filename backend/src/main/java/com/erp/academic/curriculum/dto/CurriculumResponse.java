package com.erp.academic.curriculum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Builder.Default
    private List<CurriculumCourseResponse> courses = new ArrayList<>();
}
