package com.erp.academic.facade.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class OfferingTreeDto {
    private Long courseOfferingId;
    private Long courseId;
    private String courseName;
    private Integer credits;
    private Long semesterId;
    private String semesterName;
    private List<Long> prerequisiteCourseIds;
    private List<SectionDto> sections;
}
