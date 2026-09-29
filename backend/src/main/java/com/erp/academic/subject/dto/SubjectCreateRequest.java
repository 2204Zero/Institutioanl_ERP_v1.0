package com.erp.academic.subject.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class SubjectCreateRequest {
    private String code;
    private String name;
    private String subjectType;
    private Integer credits;
    private Boolean isPractical;
    private Long departmentId;
    private Long courseId;
    private Boolean isActive;

}
