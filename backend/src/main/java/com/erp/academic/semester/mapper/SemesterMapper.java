package com.erp.academic.semester.mapper;

import com.erp.academic.semester.dto.*;
import com.erp.academic.semester.entity.Semester;
import org.springframework.stereotype.Component;

@Component
public class SemesterMapper {
    public Semester toEntity(SemesterCreateRequest request) {
        Semester entity = new Semester();
        entity.setName(request.getName());
        entity.setSemesterNumber(request.getSemesterNumber());
        entity.setAcademicYearId(request.getAcademicYearId());
        entity.setStartDate(request.getStartDate());
        entity.setEndDate(request.getEndDate());
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public SemesterResponse toResponse(Semester entity) {
        SemesterResponse response = new SemesterResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setSemesterNumber(entity.getSemesterNumber());
        response.setAcademicYearId(entity.getAcademicYearId());
        response.setStartDate(entity.getStartDate());
        response.setEndDate(entity.getEndDate());
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Semester entity, SemesterUpdateRequest request) {
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getSemesterNumber() != null) {
            entity.setSemesterNumber(request.getSemesterNumber());
        }
        if (request.getAcademicYearId() != null) {
            entity.setAcademicYearId(request.getAcademicYearId());
        }
        if (request.getStartDate() != null) {
            entity.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            entity.setEndDate(request.getEndDate());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

    }
}
