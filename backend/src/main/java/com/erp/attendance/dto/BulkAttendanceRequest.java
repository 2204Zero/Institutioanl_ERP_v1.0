package com.erp.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record BulkAttendanceRequest(
        @NotNull(message = "Section ID is required")
        Long sectionId,

        @NotNull(message = "Schedule ID is required")
        Long scheduleId,

        @NotNull(message = "Attendance date is required")
        LocalDate date,

        @NotEmpty(message = "Records list cannot be empty")
        @Valid
        List<AttendanceRecordEntry> records
) {}
