package com.erp.student.dto;

import java.time.LocalDate;

public record StudentIdCardDto(
        Long studentId,
        String enrollmentNumber,
        String rollNumber,
        String fullName,
        String email,
        String phone,
        String bloodGroup,
        String department,
        String program,
        String batch,
        String status,
        LocalDate dateOfBirth,
        LocalDate issueDate,
        LocalDate validThrough,
        Integer validThroughYear,
        String institutionName,
        String emergencyContact,
        String verificationCode
) {}
