package com.erp.academic.batch.dto;

public record BatchResponse(
    Long id,
    String name,
    Long programId,
    Long academicYearId,
    Boolean isActive

) {}
