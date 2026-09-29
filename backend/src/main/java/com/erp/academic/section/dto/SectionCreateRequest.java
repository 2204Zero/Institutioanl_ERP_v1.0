package com.erp.academic.section.dto;

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
public class SectionCreateRequest {

    @NotBlank(message = "Section name is required")
    private String name;

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Semester ID is required")
    private Long semesterId;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Section capacity must be at least 1")
    private Integer capacity;

    private Boolean isActive;
}
