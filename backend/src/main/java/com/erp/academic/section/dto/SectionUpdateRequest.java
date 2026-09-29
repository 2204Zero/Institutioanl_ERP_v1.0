package com.erp.academic.section.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class SectionUpdateRequest {
    private String name;
    private Long batchId;
    private Long semesterId;
    private Integer capacity;
    private Boolean isActive;

}
