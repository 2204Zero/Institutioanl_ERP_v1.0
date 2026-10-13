package com.erp.student.dto;

import java.time.LocalDate;
import java.util.List;

public record StudentTranscriptDto(
        Long studentId,
        String enrollmentNumber,
        String rollNumber,
        String fullName,
        String department,
        String program,
        String batch,
        String status,
        Double cumulativeGpa,
        Integer totalCreditsEarned,
        LocalDate issueDate,
        String institutionName,
        List<TranscriptCourseItem> courses
) {
    public record TranscriptCourseItem(
            String courseCode,
            String courseName,
            Integer credits,
            String sectionName,
            String status,
            String grade
    ) {}
}
