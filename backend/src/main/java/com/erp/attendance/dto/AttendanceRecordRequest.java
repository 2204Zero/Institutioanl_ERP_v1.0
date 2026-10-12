package com.erp.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record AttendanceRecordRequest(
        @NotNull(message = "Student ID is required")
        Long studentId,

        String courseCode,

        @NotBlank(message = "Attendance status is required")
        @Pattern(regexp = "^(?i)(PRESENT|ABSENT|LATE|EXCUSED)$", message = "Status must be PRESENT, ABSENT, LATE, or EXCUSED")
        String status,

        String remarks,

        LocalDate date,

        Long scheduleId
) {
    public AttendanceRecordRequest(Long studentId, String courseCode, String status, String remarks) {
        this(studentId, courseCode, status, remarks, null, null);
    }
}

