package com.erp.academic.facade.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectionDto {
    private Long sectionId;
    private String sectionName;
    private Integer capacity;
    private Integer currentEnrollment;
    private boolean isFull;
}
