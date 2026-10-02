package com.erp.academic.section.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionResponse {
    private Long id;
    private String name;
    private Long batchId;
    private Long semesterId;
    private Integer capacity;
    private Integer currentEnrollment;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}
