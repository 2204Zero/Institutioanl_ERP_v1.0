package com.erp.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AttendanceRecordEntry(
        @NotNull(message = "Student ID is required")
        Long studentId,

        @NotBlank(message = "Attendance status is required")
        @Pattern(regexp = "^(PRESENT|ABSENT|LATE|EXCUSED)$", message = "Status must be PRESENT, ABSENT, LATE, or EXCUSED")
        String status,

        String remarks
) {}
