package com.example.demo.session.dto;

import java.time.LocalDateTime;

public record SessionResponse(
    Long id,
    String sessionToken,
    LocalDateTime expiresAt,
    String status
) {}
