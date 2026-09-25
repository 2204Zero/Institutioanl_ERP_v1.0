package com.erp.academic.semester.dto;

public record SemesterCreateRequest(
    String name,
    Long academicYearId,
    Boolean isActive

) {}
