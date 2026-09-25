package com.erp.academic.semester.dto;

public record SemesterUpdateRequest(
    String name,
    Long academicYearId,
    Boolean isActive

) {}
