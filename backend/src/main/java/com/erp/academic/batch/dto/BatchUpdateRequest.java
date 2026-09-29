package com.erp.academic.batch.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class BatchUpdateRequest {
    private String name;
    private String code;
    private Long programId;
    private Integer admissionYear;
    private Integer graduationYear;
    private Long academicYearId;
    private Boolean isActive;

}
