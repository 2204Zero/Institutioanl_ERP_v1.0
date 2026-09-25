package com.erp.department.dto;

public record DepartmentCreateRequest(
    String name,
    String code,
    Long campusId

) {}
