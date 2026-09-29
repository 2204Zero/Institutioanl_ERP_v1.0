package com.erp.academic.program.dto;

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
public class ProgramCreateRequest {

    @NotBlank(message = "Program code is required")
    private String code;

    @NotBlank(message = "Program name is required")
    private String name;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 year")
    private Integer duration;

    private Boolean isActive;
}
