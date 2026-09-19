package com.erp.guardian.mapper;

import com.erp.guardian.dto.*;
import com.erp.guardian.entity.Guardian;
import org.springframework.stereotype.Component;

@Component
public class GuardianMapper {
    public Guardian toEntity(GuardianCreateRequest request) {
        Guardian entity = new Guardian();
        // Set fields from request
        return entity;
    }

    public GuardianResponse toResponse(Guardian entity) {
        return new GuardianResponse(
            entity.getId(), entity.getFirstName() , entity.getLastName() , entity.getPhone() , entity.getStudentId()
        );
    }
}
