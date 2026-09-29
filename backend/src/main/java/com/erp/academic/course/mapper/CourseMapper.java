package com.erp.academic.course.mapper;

import com.erp.academic.course.dto.*;
import com.erp.academic.course.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {
    public Course toEntity(CourseCreateRequest request) {
        Course entity = new Course();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setCourseType(request.getCourseType());
        entity.setCredits(request.getCredits());
        entity.setDepartmentId(request.getDepartmentId());
        entity.setProgramId(request.getProgramId());
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public CourseResponse toResponse(Course entity) {
        CourseResponse response = new CourseResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setCourseType(entity.getCourseType());
        response.setCredits(entity.getCredits());
        response.setDepartmentId(entity.getDepartmentId());
        response.setProgramId(entity.getProgramId());
        response.setIsActive(entity.getIsActive());

        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
    
    public void updateEntity(Course entity, CourseUpdateRequest request) {
        if (request.getCode() != null) {
            entity.setCode(request.getCode());
        }
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getCourseType() != null) {
            entity.setCourseType(request.getCourseType());
        }
        if (request.getCredits() != null) {
            entity.setCredits(request.getCredits());
        }
        if (request.getDepartmentId() != null) {
            entity.setDepartmentId(request.getDepartmentId());
        }
        if (request.getProgramId() != null) {
            entity.setProgramId(request.getProgramId());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }

    }
}
