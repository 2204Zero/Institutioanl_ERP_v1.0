package com.erp.faculty.dto;

public record FacultyProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String officialEmail,
        Long departmentId,
        String departmentName,
        Long userId,
        Boolean isActive
) {}
