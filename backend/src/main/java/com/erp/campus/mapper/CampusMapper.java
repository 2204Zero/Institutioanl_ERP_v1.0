package com.erp.campus.mapper;

import com.erp.campus.dto.*;
import com.erp.campus.entity.Campus;
import org.springframework.stereotype.Component;

@Component
public class CampusMapper {
    public Campus toEntity(CampusCreateRequest request) {
        Campus entity = new Campus();
        entity.setName(request.name());
        entity.setAddress(request.address());
        entity.setInstitutionId(request.institutionId());
        return entity;
    }

    public CampusResponse toResponse(Campus entity) {
        return new CampusResponse(
            entity.getId(), entity.getName() , entity.getAddress() , entity.getInstitutionId()
        );
    }
}
