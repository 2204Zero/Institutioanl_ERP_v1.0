package com.example.demo.audit;

import java.time.Instant;

public record AuditEntry(
        String actor,
        String action,
        String resource,
        String resourceId,
        Instant timestamp,
        String result,
        String requestContext
) {
}
