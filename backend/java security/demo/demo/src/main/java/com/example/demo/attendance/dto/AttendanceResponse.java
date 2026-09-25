package com.example.demo.attendance.dto;

import java.time.LocalDate;

public record AttendanceResponse(
        Long id,
        Long studentId,
        String courseCode,
        LocalDate date,
        String status,
        String markedBy,
        String remarks
) {}
