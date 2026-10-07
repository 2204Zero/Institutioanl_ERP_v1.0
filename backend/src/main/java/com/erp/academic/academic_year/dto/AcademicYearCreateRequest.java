package com.erp.academic.academic_year.dto;

public record AcademicYearCreateRequest(
    String name,
    java.time.LocalDate startDate,
    java.time.LocalDate endDate,
    Boolean isActive

) {}
