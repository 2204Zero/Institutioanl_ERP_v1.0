package com.example.demo.user.dto;

import jakarta.validation.constraints.Email;

public record UserUpdateRequest(
    String username,
    @Email(message = "Invalid email format")
    String email,
    String status
) {}
