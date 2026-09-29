package com.erp.academic.batch.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class BatchResponse {
    private Long id;
    private String name;
    private String code;
    private Long programId;
    private Integer admissionYear;
    private Integer graduationYear;
    private Long academicYearId;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}
