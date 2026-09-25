package com.erp.academic.batch.mapper;

import com.erp.academic.batch.dto.*;
import com.erp.academic.batch.entity.Batch;
import org.springframework.stereotype.Component;

@Component
public class BatchMapper {
    public Batch toEntity(BatchCreateRequest request) {
        Batch entity = new Batch();
        // Set fields from request
        return entity;
    }

    public BatchResponse toResponse(Batch entity) {
        return new BatchResponse(
            entity.getId(), entity.getName() , entity.getProgramId() , entity.getAcademicYearId() , entity.getIsActive()
        );
    }
}
