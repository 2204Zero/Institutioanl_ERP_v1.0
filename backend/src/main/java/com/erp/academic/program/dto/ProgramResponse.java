package com.erp.academic.program.dto;

public record ProgramResponse(
    Long id,
    String name,
    String code,
    Long departmentId

) {}
