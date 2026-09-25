package com.erp.academic.batch.dto;

public record BatchUpdateRequest(
    String name,
    Long programId,
    Long academicYearId,
    Boolean isActive

) {}
