package com.erp.academic.batch.dto;

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
public class BatchCreateRequest {

    @NotBlank(message = "Batch name is required")
    private String name;

    @NotBlank(message = "Batch code is required")
    private String code;

    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotNull(message = "Admission year is required")
    @Min(value = 1900, message = "Admission year must be valid")
    private Integer admissionYear;

    @NotNull(message = "Graduation year is required")
    @Min(value = 1900, message = "Graduation year must be valid")
    private Integer graduationYear;

    private Long academicYearId;

    private Boolean isActive;
}
