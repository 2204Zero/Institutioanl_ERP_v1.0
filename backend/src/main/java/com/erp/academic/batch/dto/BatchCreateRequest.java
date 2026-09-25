package com.erp.academic.batch.dto;

public record BatchCreateRequest(
    String name,
    Long programId,
    Long academicYearId,
    Boolean isActive

) {}
