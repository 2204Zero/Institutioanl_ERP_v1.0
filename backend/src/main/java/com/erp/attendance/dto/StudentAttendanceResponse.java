package com.erp.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceResponse {
    private Long id;
    private Long studentId;
    private String status;
    private String remarks;
    private Long markedByFacultyId;
    private Instant recordedAt;
}
