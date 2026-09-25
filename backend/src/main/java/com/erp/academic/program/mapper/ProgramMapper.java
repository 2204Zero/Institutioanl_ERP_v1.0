package com.erp.academic.program.mapper;

import com.erp.academic.program.dto.*;
import com.erp.academic.program.entity.Program;
import org.springframework.stereotype.Component;

@Component
public class ProgramMapper {
    public Program toEntity(ProgramCreateRequest request) {
        Program entity = new Program();
        // Set fields from request
        return entity;
    }

    public ProgramResponse toResponse(Program entity) {
        return new ProgramResponse(
            entity.getId(), entity.getName() , entity.getCode() , entity.getDepartmentId()
        );
    }
}
