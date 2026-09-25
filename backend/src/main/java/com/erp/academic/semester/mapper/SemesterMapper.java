package com.erp.academic.semester.mapper;

import com.erp.academic.semester.dto.*;
import com.erp.academic.semester.entity.Semester;
import org.springframework.stereotype.Component;

@Component
public class SemesterMapper {
    public Semester toEntity(SemesterCreateRequest request) {
        Semester entity = new Semester();
        // Set fields from request
        return entity;
    }

    public SemesterResponse toResponse(Semester entity) {
        return new SemesterResponse(
            entity.getId(), entity.getName() , entity.getAcademicYearId() , entity.getIsActive()
        );
    }
}
