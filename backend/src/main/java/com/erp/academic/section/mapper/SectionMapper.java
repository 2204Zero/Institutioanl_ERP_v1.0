package com.erp.academic.section.mapper;

import com.erp.academic.section.dto.*;
import com.erp.academic.section.entity.Section;
import org.springframework.stereotype.Component;

@Component
public class SectionMapper {

    public Section toEntity(SectionCreateRequest request) {
        Section entity = new Section();
        entity.setName(request.getName());
        entity.setBatchId(request.getBatchId());
        entity.setSemesterId(request.getSemesterId());
        entity.setCapacity(request.getCapacity());
        entity.setCurrentEnrollment(0);
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public SectionResponse toResponse(Section entity) {
        SectionResponse response = new SectionResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setBatchId(entity.getBatchId());
        response.setSemesterId(entity.getSemesterId());
        response.setCapacity(entity.getCapacity());
        response.setCurrentEnrollment(entity.getCurrentEnrollment() != null ? entity.getCurrentEnrollment() : 0);
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Section entity, SectionUpdateRequest request) {
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getBatchId() != null) {
            entity.setBatchId(request.getBatchId());
        }
        if (request.getSemesterId() != null) {
            entity.setSemesterId(request.getSemesterId());
        }
        if (request.getCapacity() != null) {
            entity.setCapacity(request.getCapacity());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }
}
