package com.erp.academic.semester.dto;

public record SemesterResponse(
    Long id,
    String name,
    Long academicYearId,
    Boolean isActive

) {}
