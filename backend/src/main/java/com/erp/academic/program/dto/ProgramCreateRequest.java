package com.erp.academic.program.dto;

public record ProgramCreateRequest(
    String name,
    String code,
    Long departmentId

) {}
