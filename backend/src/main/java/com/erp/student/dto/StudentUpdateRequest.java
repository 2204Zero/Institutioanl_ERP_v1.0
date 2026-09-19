package com.erp.student.dto;

public record StudentUpdateRequest(
    String firstName,
    String lastName,
    String email

) {}
