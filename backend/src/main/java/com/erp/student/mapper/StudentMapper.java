package com.erp.student.mapper;

import com.erp.student.dto.*;
import com.erp.student.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {
    public Student toEntity(StudentCreateRequest request) {
        Student entity = new Student();
        // Set fields from request
        return entity;
    }

    public StudentResponse toResponse(Student entity) {
        return new StudentResponse(
            entity.getId(), entity.getFirstName() , entity.getLastName() , entity.getEmail()
        );
    }
}
