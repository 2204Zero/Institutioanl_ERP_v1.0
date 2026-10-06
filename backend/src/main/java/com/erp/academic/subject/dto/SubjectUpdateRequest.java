package com.erp.academic.subject.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectUpdateRequest {
    private String code;
    private String name;
    private String subjectType;

    @Min(value = 0, message = "Credits cannot be negative")
    private Integer credits;

    private Boolean isPractical;
    private Long departmentId;
    private Long courseId;
    private Long programId;
    private Boolean isActive;
}
