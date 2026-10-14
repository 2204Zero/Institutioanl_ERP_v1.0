package com.erp.admission.application.dto;

import com.erp.admission.application.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionApplicationDto {
    private Long id;
    private String applicationNumber;
    private Long applicantId;
    private Long programId;
    private Long academicYearId;
    private ApplicationStatus status;
    private Double meritScore;
    private Instant submittedAt;
    private Instant createdAt;
}
