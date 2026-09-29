package com.erp.academic.batch.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchUpdateRequest {

    private String name;
    private String code;
    private Long programId;

    @Min(value = 1900, message = "Admission year must be valid")
    private Integer admissionYear;

    @Min(value = 1900, message = "Graduation year must be valid")
    private Integer graduationYear;

    private Long academicYearId;
    private Boolean isActive;
}
