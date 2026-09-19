package com.erp.guardian.dto;

public record GuardianUpdateRequest(
    String firstName,
    String lastName,
    String phone,
    Long studentId

) {}
