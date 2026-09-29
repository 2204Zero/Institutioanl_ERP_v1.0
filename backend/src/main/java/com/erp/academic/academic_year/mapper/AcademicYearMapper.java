package com.erp.academic.academic_year.mapper;

import com.erp.academic.academic_year.dto.*;
import com.erp.academic.academic_year.entity.AcademicYear;
import org.springframework.stereotype.Component;

@Component
public class AcademicYearMapper {
    public AcademicYear toEntity(AcademicYearCreateRequest request) {
        AcademicYear entity = new AcademicYear();
        entity.setName(request.name());
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        entity.setIsActive(request.isActive());
        return entity;
    }

    public AcademicYearResponse toResponse(AcademicYear entity) {
        return new AcademicYearResponse(
            entity.getId(), entity.getName() , entity.getStartDate() , entity.getEndDate() , entity.getIsActive()
        );
    }
}
