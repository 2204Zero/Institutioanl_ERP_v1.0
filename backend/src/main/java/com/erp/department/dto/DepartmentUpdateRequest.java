package com.erp.department.dto;

public record DepartmentUpdateRequest(
    String name,
    String code,
    Long campusId

) {}
