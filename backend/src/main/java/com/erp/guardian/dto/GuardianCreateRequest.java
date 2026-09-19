package com.erp.guardian.dto;

public record GuardianCreateRequest(
    String firstName,
    String lastName,
    String phone,
    Long studentId

) {}
