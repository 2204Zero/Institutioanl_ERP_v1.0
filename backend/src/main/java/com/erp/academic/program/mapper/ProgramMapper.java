package com.erp.academic.program.mapper;

import com.erp.academic.program.dto.*;
import com.erp.academic.program.entity.Program;
import org.springframework.stereotype.Component;

@Component
public class ProgramMapper {
    public Program toEntity(ProgramCreateRequest request) {
        Program entity = new Program();
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setDegree(request.getDegree());
        entity.setDuration(request.getDuration());
        entity.setDepartmentId(request.getDepartmentId());
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public ProgramResponse toResponse(Program entity) {
        ProgramResponse response = new ProgramResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setCode(entity.getCode());
        response.setDegree(entity.getDegree());
        response.setDuration(entity.getDuration());
        response.setDepartmentId(entity.getDepartmentId());
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Program entity, ProgramUpdateRequest request) {
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getCode() != null) {
            entity.setCode(request.getCode());
        }
        if (request.getDegree() != null) {
            entity.setDegree(request.getDegree());
        }
        if (request.getDuration() != null) {
            entity.setDuration(request.getDuration());
        }
        if (request.getDepartmentId() != null) {
            entity.setDepartmentId(request.getDepartmentId());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

    }
}
