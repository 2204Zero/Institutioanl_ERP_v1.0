package com.erp.academic.semester.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class SemesterUpdateRequest {
    private String name;
    private Integer semesterNumber;
    private Long academicYearId;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate startDate;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate endDate;
    private Boolean isActive;

}
