package com.erp.academic.subject.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectCreateRequest {

    @NotBlank(message = "Subject code is required")
    private String code;

    @NotBlank(message = "Subject name is required")
    private String name;

    @NotBlank(message = "Subject type is required (e.g. CORE, ELECTIVE, AUDIT)")
    private String subjectType;

    @NotNull(message = "Credits are required")
    @Min(value = 0, message = "Credits cannot be negative")
    private Integer credits;

    @NotNull(message = "isPractical is required (true for practical/lab, false for theory)")
    private Boolean isPractical;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long courseId;
    private Long programId;
    private Boolean isActive;
}
