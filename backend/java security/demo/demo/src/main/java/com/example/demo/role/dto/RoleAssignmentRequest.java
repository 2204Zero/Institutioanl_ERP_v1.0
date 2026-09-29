package com.example.demo.role.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleAssignmentRequest(
    @NotBlank(message = "Role name cannot be blank")
    String roleName
) {}
