package com.erp.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AttendanceRecordRequest(
        @NotNull(message = "Student ID is required")
        Long studentId,

        @NotBlank(message = "Course code is required")
        String courseCode,

        @NotBlank(message = "Attendance status is required (PRESENT, ABSENT, LATE)")
        String status,

        String remarks
) {}

