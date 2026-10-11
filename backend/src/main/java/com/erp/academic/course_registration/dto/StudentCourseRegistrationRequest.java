package com.erp.academic.course_registration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCourseRegistrationRequest {

    @NotNull(message = "Course offering ID is required")
    private Long courseOfferingId;

    @NotNull(message = "Section ID is required")
    private Long sectionId;
}
