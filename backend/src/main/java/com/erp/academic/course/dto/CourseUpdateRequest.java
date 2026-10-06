package com.erp.academic.course.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseUpdateRequest {

    private String code;
    private String name;
    private String courseType;

    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    private Long departmentId;
    private Long programId;
    private Boolean isActive;
}
