package com.erp.auth.dto;

import java.time.Instant;
import java.util.Set;

public record SessionResponse(
        String username,
        String role,
        Set<String> permissions,
        boolean active,
        Instant issuedAt,
        Instant expiresAt,
        String message
) {}

