package com.erp.student.dto;

public record StudentCreateRequest(
    String firstName,
    String lastName,
    String email

) {}
