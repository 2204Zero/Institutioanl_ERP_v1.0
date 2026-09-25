package com.erp.department.dto;

public record DepartmentResponse(
    Long id,
    String name,
    String code,
    Long campusId

) {}
