package com.erp.student.mapper;

import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.dto.GuardianResponseDto;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.mapper.GuardianMapper;
import com.erp.student.dto.StudentDocumentResponseDto;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.dto.StudentResponseDto;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentDocument;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class StudentMapper {

    public Student toEntity(StudentRequestDto dto) {
        if (dto == null) return null;
        Student student = new Student();
        student.setRollNumber(dto.getRollNumber().trim());
        student.setFirstName(dto.getFirstName().trim());
        student.setLastName(dto.getLastName().trim());
        student.setEmail(dto.getEmail().trim().toLowerCase());
        student.setPhone(dto.getPhone().trim());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setGender(dto.getGender());
        student.setBloodGroup(dto.getBloodGroup());
        student.setAddress(dto.getAddress());
        student.setCity(dto.getCity());
        student.setState(dto.getState());
        student.setPincode(dto.getPincode());
        student.setDepartment(dto.getDepartment().trim());
        student.setProgram(dto.getProgram());
        student.setBatch(dto.getBatch().trim());
        student.setEnrollmentDate(dto.getEnrollmentDate());
        if (dto.getStatus() != null) {
            student.setStatus(dto.getStatus());
        }
        return student;
    }

    public void updateEntityFromDto(StudentRequestDto dto, Student student) {
        if (dto == null || student == null) return;
        student.setRollNumber(dto.getRollNumber().trim());
        student.setFirstName(dto.getFirstName().trim());
        student.setLastName(dto.getLastName().trim());
        student.setEmail(dto.getEmail().trim().toLowerCase());
        student.setPhone(dto.getPhone().trim());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setGender(dto.getGender());
        student.setBloodGroup(dto.getBloodGroup());
        student.setAddress(dto.getAddress());
        student.setCity(dto.getCity());
        student.setState(dto.getState());
        student.setPincode(dto.getPincode());
        student.setDepartment(dto.getDepartment().trim());
        student.setProgram(dto.getProgram());
        student.setBatch(dto.getBatch().trim());
        student.setEnrollmentDate(dto.getEnrollmentDate());
        if (dto.getStatus() != null) {
            student.setStatus(dto.getStatus());
        }
    }

    public StudentResponseDto toDto(Student entity) {
        if (entity == null) return null;
        StudentResponseDto dto = new StudentResponseDto();
        dto.setId(entity.getId());
        dto.setRollNumber(entity.getRollNumber());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setFullName(entity.getFirstName() + " " + entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setGender(entity.getGender());
        dto.setBloodGroup(entity.getBloodGroup());
        dto.setAddress(entity.getAddress());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setPincode(entity.getPincode());
        dto.setDepartment(entity.getDepartment());
        dto.setProgram(entity.getProgram());
        dto.setBatch(entity.getBatch());
        dto.setEnrollmentDate(entity.getEnrollmentDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getGuardians() != null) {
            dto.setGuardians(entity.getGuardians().stream()
                    .map(this::toGuardianDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setGuardians(Collections.emptyList());
        }

        if (entity.getDocuments() != null) {
            dto.setDocuments(entity.getDocuments().stream()
                    .map(this::toDocumentDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setDocuments(Collections.emptyList());
        }

        return dto;
    }

    public Guardian toGuardianEntity(GuardianRequestDto dto) {
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

    public void updateGuardianEntityFromDto(GuardianRequestDto dto, Guardian guardian) {
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

    public GuardianResponseDto toGuardianDto(Guardian entity) {
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

    public StudentDocumentResponseDto toDocumentDto(StudentDocument entity) {
        if (entity == null) return null;
        StudentDocumentResponseDto dto = new StudentDocumentResponseDto();
        dto.setId(entity.getId());
        if (entity.getStudent() != null) {
            dto.setStudentId(entity.getStudent().getId());
        }
        dto.setDocumentType(entity.getDocumentType());
        dto.setFileName(entity.getFileName());
        dto.setOriginalFileName(entity.getOriginalFileName());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setDownloadUrl("/api/v1/documents/" + entity.getId() + "/download");
        dto.setViewUrl("/api/v1/documents/" + entity.getId() + "/view");
        dto.setUploadedAt(entity.getUploadedAt());
        return dto;
    }
}
