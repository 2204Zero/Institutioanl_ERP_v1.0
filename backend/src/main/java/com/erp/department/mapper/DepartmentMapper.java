package com.erp.department.mapper;

import com.erp.department.dto.*;
import com.erp.department.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {
    public Department toEntity(DepartmentCreateRequest request) {
        Department entity = new Department();
        entity.setName(request.name());
        entity.setCode(request.code());
        entity.setCampusId(request.campusId());
        return entity;
    }

    public DepartmentResponse toResponse(Department entity) {
        return new DepartmentResponse(
            entity.getId(), entity.getName() , entity.getCode() , entity.getCampusId()
        );
    }
}
