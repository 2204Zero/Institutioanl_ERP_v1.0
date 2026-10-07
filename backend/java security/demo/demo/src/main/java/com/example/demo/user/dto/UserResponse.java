package com.example.demo.user.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponse(
    Long id,
    String username,
    String email,
    String status,
    Set<String> roles,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
