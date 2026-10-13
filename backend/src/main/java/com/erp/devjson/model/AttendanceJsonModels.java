package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceRecord {
        private Long id;
        private Long studentId;
        private Long scheduleId;
        private LocalDate attendanceDate;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;
        private Long markedByFacultyId;
        private LocalDateTime recordedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceSummary {
        private Long studentId;
        private long totalSessions;
        private long attendedSessions; // PRESENT + LATE + EXCUSED
        private long absentSessions;
        private double percentage;
    }
}
