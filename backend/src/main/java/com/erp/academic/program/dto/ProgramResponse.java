package com.erp.academic.program.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ProgramResponse {
    private Long id;
    private String name;
    private String code;
    private String degree;
    private Integer duration;
    private Long departmentId;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}
