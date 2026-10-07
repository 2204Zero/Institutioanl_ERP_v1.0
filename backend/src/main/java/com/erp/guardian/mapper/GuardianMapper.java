package com.erp.guardian.mapper;

import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.dto.GuardianResponseDto;
import com.erp.guardian.entity.Guardian;
import org.springframework.stereotype.Component;

@Component
public class GuardianMapper {

    public Guardian toEntity(GuardianRequestDto dto) {
        if (dto == null) return null;
        Guardian guardian = new Guardian();
        guardian.setFirstName(dto.getFirstName().trim());
        guardian.setLastName(dto.getLastName().trim());
        guardian.setRelation(dto.getRelation().trim());
        guardian.setPhone(dto.getPhone().trim());
        guardian.setEmail(dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null);
        guardian.setOccupation(dto.getOccupation());
        guardian.setAddress(dto.getAddress());
        guardian.setIsEmergencyContact(dto.getIsEmergencyContact() != null ? dto.getIsEmergencyContact() : false);
        return guardian;
    }

    public void updateEntityFromDto(GuardianRequestDto dto, Guardian guardian) {
        if (dto == null || guardian == null) return;
        guardian.setFirstName(dto.getFirstName().trim());
        guardian.setLastName(dto.getLastName().trim());
        guardian.setRelation(dto.getRelation().trim());
        guardian.setPhone(dto.getPhone().trim());
        guardian.setEmail(dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null);
        guardian.setOccupation(dto.getOccupation());
        guardian.setAddress(dto.getAddress());
        if (dto.getIsEmergencyContact() != null) {
            guardian.setIsEmergencyContact(dto.getIsEmergencyContact());
        }
    }

    public GuardianResponseDto toDto(Guardian entity) {
        if (entity == null) return null;
        GuardianResponseDto dto = new GuardianResponseDto();
        dto.setId(entity.getId());
        if (entity.getStudent() != null) {
            dto.setStudentId(entity.getStudent().getId());
            dto.setStudentName(entity.getStudent().getFirstName() + " " + entity.getStudent().getLastName());
        }
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setFullName(entity.getFirstName() + " " + entity.getLastName());
        dto.setRelation(entity.getRelation());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setOccupation(entity.getOccupation());
        dto.setAddress(entity.getAddress());
        dto.setIsEmergencyContact(entity.getIsEmergencyContact());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
