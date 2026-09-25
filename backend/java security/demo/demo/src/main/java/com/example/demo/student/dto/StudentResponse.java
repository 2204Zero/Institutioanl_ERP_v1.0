package com.example.demo.student.dto;

public record StudentResponse(
        Long id,
        String enrollmentNumber,
        String name,
        String email,
        String department,
        String status
) {}
