package com.erp.academic.curriculum.mapper;

import com.erp.academic.curriculum.dto.*;
import com.erp.academic.curriculum.entity.Curriculum;
import org.springframework.stereotype.Component;

@Component
public class CurriculumMapper {
    public Curriculum toEntity(CurriculumCreateRequest request) {
        Curriculum entity = new Curriculum();
        entity.setVersion(request.getVersion());
        entity.setProgramId(request.getProgramId());
        entity.setSemesterId(request.getSemesterId());
        entity.setEffectiveAcademicYearId(request.getEffectiveAcademicYearId());
        entity.setTotalCredits(request.getTotalCredits());
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public CurriculumResponse toResponse(Curriculum entity) {
        CurriculumResponse response = new CurriculumResponse();
        response.setId(entity.getId());
        response.setVersion(entity.getVersion());
        response.setProgramId(entity.getProgramId());
        response.setSemesterId(entity.getSemesterId());
        response.setEffectiveAcademicYearId(entity.getEffectiveAcademicYearId());
        response.setTotalCredits(entity.getTotalCredits());
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Curriculum entity, CurriculumUpdateRequest request) {
        if (request.getVersion() != null) {
            entity.setVersion(request.getVersion());
        }
        if (request.getProgramId() != null) {
            entity.setProgramId(request.getProgramId());
        }
        if (request.getSemesterId() != null) {
            entity.setSemesterId(request.getSemesterId());
        }
        if (request.getEffectiveAcademicYearId() != null) {
            entity.setEffectiveAcademicYearId(request.getEffectiveAcademicYearId());
        }
        if (request.getTotalCredits() != null) {
            entity.setTotalCredits(request.getTotalCredits());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

    }
}
