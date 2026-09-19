package com.erp.guardian.dto;

public record GuardianResponse(
    Long id,
    String firstName,
    String lastName,
    String phone,
    Long studentId

) {}
