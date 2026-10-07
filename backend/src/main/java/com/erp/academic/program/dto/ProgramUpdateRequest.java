package com.erp.academic.program.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramUpdateRequest {

    private String code;
    private String name;
    private String degree;
    private Long departmentId;

    @Min(value = 1, message = "Duration must be at least 1 year")
    private Integer duration;

    private Boolean isActive;
}
