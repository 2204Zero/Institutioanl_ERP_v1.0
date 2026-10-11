package com.erp.attendance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionAttendanceResponse {
    private Long sectionId;
    private Long scheduleId;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private List<StudentAttendanceResponse> records;
}
