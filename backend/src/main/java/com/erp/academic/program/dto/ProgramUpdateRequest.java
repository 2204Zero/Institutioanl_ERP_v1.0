package com.erp.academic.program.dto;

public record ProgramUpdateRequest(
    String name,
    String code,
    Long departmentId

) {}
