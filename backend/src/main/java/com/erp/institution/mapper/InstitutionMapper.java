package com.erp.institution.mapper;

import com.erp.institution.dto.*;
import com.erp.institution.entity.Institution;
import org.springframework.stereotype.Component;

@Component
public class InstitutionMapper {
    public Institution toEntity(InstitutionCreateRequest request) {
        Institution entity = new Institution();
        entity.setName(request.name());
        entity.setCode(request.code());
        return entity;
    }

    public InstitutionResponse toResponse(Institution entity) {
        return new InstitutionResponse(
            entity.getId(), entity.getName() , entity.getCode()
        );
    }
}
