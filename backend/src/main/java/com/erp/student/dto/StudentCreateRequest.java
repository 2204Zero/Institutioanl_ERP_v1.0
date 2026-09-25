package com.erp.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StudentCreateRequest(
        @NotBlank(message = "Student name is required")
        String name,

        @NotBlank(message = "Student email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Department is required")
        String department
) {}

