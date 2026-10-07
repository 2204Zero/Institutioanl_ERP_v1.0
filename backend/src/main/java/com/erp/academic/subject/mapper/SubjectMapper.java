package com.erp.academic.subject.mapper;

import com.erp.academic.subject.dto.*;
import com.erp.academic.subject.entity.Subject;
import org.springframework.stereotype.Component;

@Component
public class SubjectMapper {

    public Subject toEntity(SubjectCreateRequest request) {
        Subject entity = new Subject();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setSubjectType(request.getSubjectType());
        entity.setCredits(request.getCredits());
        entity.setIsPractical(request.getIsPractical());
        entity.setDepartmentId(request.getDepartmentId());
        entity.setCourseId(request.getCourseId());
        entity.setProgramId(request.getProgramId());
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public SubjectResponse toResponse(Subject entity) {
        SubjectResponse response = new SubjectResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setSubjectType(entity.getSubjectType());
        response.setCredits(entity.getCredits());
        response.setIsPractical(entity.getIsPractical());
        response.setDepartmentId(entity.getDepartmentId());
        response.setCourseId(entity.getCourseId());
        response.setProgramId(entity.getProgramId());
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Subject entity, SubjectUpdateRequest request) {
        if (request.getCode() != null) {
            entity.setCode(request.getCode());
        }
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getSubjectType() != null) {
            entity.setSubjectType(request.getSubjectType());
        }
        if (request.getCredits() != null) {
            entity.setCredits(request.getCredits());
        }
        if (request.getIsPractical() != null) {
            entity.setIsPractical(request.getIsPractical());
        }
        if (request.getDepartmentId() != null) {
            entity.setDepartmentId(request.getDepartmentId());
        }
        if (request.getCourseId() != null) {
            entity.setCourseId(request.getCourseId());
        }
        if (request.getProgramId() != null) {
            entity.setProgramId(request.getProgramId());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }
}
