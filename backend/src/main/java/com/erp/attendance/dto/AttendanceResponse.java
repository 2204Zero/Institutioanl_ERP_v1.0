package com.erp.attendance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

public record AttendanceResponse(
        Long id,
        Long studentId,
        String studentName,
        String rollNumber,
        String courseCode,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate date,
        String status,
        String markedBy,
        String remarks
) {
    public AttendanceResponse(Long id, Long studentId, String courseCode, LocalDate date, String status, String markedBy, String remarks) {
        this(id, studentId, null, null, courseCode, date, status, markedBy, remarks);
    }
}

