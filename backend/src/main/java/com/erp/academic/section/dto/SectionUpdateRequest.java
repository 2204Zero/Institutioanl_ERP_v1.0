package com.erp.academic.section.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionUpdateRequest {
    private String name;
    private Long batchId;
    private Long semesterId;

    @Min(value = 1, message = "Section capacity must be at least 1")
    private Integer capacity;

    private Boolean isActive;
}
