package com.example.demo.notification;

import java.time.Instant;

public record AttendanceCorrectionAudit(
        String recordId,
        String oldStatus,
        String newStatus,
        String reason,
        String changedBy,
        Instant timestamp
) {
    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Palak
    // MODULE: #39 Attendance Correction
    // PENDING: Attendance Modification Service
    // ACTION REQUIRED ONCE READY: Populate this DTO and route it to AuditLogService 
    // whenever an attendance record's status is modified.
    // ============================================================================
}
