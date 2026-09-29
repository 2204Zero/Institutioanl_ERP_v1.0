package com.erp.academic.course.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CourseCreateRequest {
    private String code;
    private String name;
    private String courseType;
    private Integer credits;
    private Long departmentId;
    private Long programId;
    private Boolean isActive;

}
