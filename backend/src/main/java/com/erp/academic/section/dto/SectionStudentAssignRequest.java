package com.erp.academic.section.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionStudentAssignRequest {

    @NotEmpty(message = "At least one student ID must be provided")
    private List<Long> studentIds;
}
