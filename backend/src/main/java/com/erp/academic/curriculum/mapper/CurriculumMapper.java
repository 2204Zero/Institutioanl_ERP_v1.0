package com.erp.academic.curriculum.mapper;

import com.erp.academic.curriculum.dto.*;
import com.erp.academic.curriculum.entity.Curriculum;
import com.erp.academic.curriculum.entity.CurriculumCourse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CurriculumMapper {

    public Curriculum toEntity(CurriculumCreateRequest request) {
        Curriculum entity = new Curriculum();
        entity.setVersion(request.getVersion());
        entity.setProgramId(request.getProgramId());
        entity.setSemesterId(request.getSemesterId());
        entity.setEffectiveAcademicYearId(request.getEffectiveAcademicYearId());
        entity.setTotalCredits(request.getTotalCredits() != null ? request.getTotalCredits() : 0);
        entity.setIsActive(request.getIsActive());

        return entity;
    }
    
    public CurriculumResponse toResponse(Curriculum entity) {
        return toResponse(entity, new ArrayList<>());
    }

    public CurriculumResponse toResponse(Curriculum entity, List<CurriculumCourse> courses) {
        CurriculumResponse response = new CurriculumResponse();
        response.setId(entity.getId());
        response.setVersion(entity.getVersion());
        response.setProgramId(entity.getProgramId());
        response.setSemesterId(entity.getSemesterId());
        response.setEffectiveAcademicYearId(entity.getEffectiveAcademicYearId());
        response.setTotalCredits(entity.getTotalCredits());
        response.setIsActive(entity.getIsActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        if (courses != null) {
            response.setCourses(courses.stream()
                    .map(this::toCourseResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    public CurriculumCourseResponse toCourseResponse(CurriculumCourse course) {
        return CurriculumCourseResponse.builder()
                .id(course.getId())
                .curriculumId(course.getCurriculumId())
                .courseId(course.getCourseId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .classification(course.getClassification())
                .credits(course.getCredits())
                .createdAt(course.getCreatedAt())
                .build();
    }
    
    public void updateEntity(Curriculum entity, CurriculumUpdateRequest request) {
        if (request.getVersion() != null) {
            entity.setVersion(request.getVersion());
        }
        if (request.getProgramId() != null) {
            entity.setProgramId(request.getProgramId());
        }
        if (request.getSemesterId() != null) {
            entity.setSemesterId(request.getSemesterId());
        }
        if (request.getEffectiveAcademicYearId() != null) {
            entity.setEffectiveAcademicYearId(request.getEffectiveAcademicYearId());
        }
        if (request.getTotalCredits() != null) {
            entity.setTotalCredits(request.getTotalCredits());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }
}
