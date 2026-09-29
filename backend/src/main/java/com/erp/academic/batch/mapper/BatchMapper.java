package com.erp.academic.batch.mapper;

import com.erp.academic.batch.dto.*;
import com.erp.academic.batch.entity.Batch;
import org.springframework.stereotype.Component;

@Component
public class BatchMapper {
    public Batch toEntity(BatchCreateRequest request) {
        Batch entity = new Batch();
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setProgramId(request.getProgramId());
        entity.setAdmissionYear(request.getAdmissionYear());
        entity.setGraduationYear(request.getGraduationYear());
        entity.setAcademicYearId(request.getAcademicYearId());
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public BatchResponse toResponse(Batch entity) {
        BatchResponse response = new BatchResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setCode(entity.getCode());
        response.setProgramId(entity.getProgramId());
        response.setAdmissionYear(entity.getAdmissionYear());
        response.setGraduationYear(entity.getGraduationYear());
        response.setAcademicYearId(entity.getAcademicYearId());
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Batch entity, BatchUpdateRequest request) {
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getCode() != null) {
            entity.setCode(request.getCode());
        }
        if (request.getProgramId() != null) {
            entity.setProgramId(request.getProgramId());
        }
        if (request.getAdmissionYear() != null) {
            entity.setAdmissionYear(request.getAdmissionYear());
        }
        if (request.getGraduationYear() != null) {
            entity.setGraduationYear(request.getGraduationYear());
        }
        if (request.getAcademicYearId() != null) {
            entity.setAcademicYearId(request.getAcademicYearId());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

    }
}
