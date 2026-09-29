package com.erp.academic.section.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionFacultyResponse {
    private Long id;
    private Long sectionId;
    private Long facultyId;
    private Long subjectId;
    private String subjectName;
    private String role;
    private Instant assignedAt;
}
