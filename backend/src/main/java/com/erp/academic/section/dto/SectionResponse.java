package com.erp.academic.section.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class SectionResponse {
    private Long id;
    private String name;
    private Long batchId;
    private Long semesterId;
    private Integer capacity;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}
