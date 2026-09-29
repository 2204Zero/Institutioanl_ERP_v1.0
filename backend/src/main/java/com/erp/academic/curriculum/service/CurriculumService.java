package com.erp.academic.curriculum.service;

import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.exception.CourseNotFoundException;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.curriculum.dto.*;
import com.erp.academic.curriculum.entity.Curriculum;
import com.erp.academic.curriculum.entity.CurriculumCourse;
import com.erp.academic.curriculum.exception.CurriculumNotFoundException;
import com.erp.academic.curriculum.mapper.CurriculumMapper;
import com.erp.academic.curriculum.repository.CurriculumCourseRepository;
import com.erp.academic.curriculum.repository.CurriculumRepository;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurriculumService {

    private final CurriculumRepository repository;
    private final CurriculumCourseRepository curriculumCourseRepository;
    private final CourseRepository courseRepository;
    private final ProgramRepository programRepository;
    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;
    private final CurriculumMapper mapper;

    @Transactional
    public CurriculumResponse create(CurriculumCreateRequest request) {
        if (!programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        if (!semesterRepository.existsById(request.getSemesterId())) {
            throw new ResourceNotFoundException("Semester not found with id: " + request.getSemesterId());
        }

        if (!academicYearRepository.existsById(request.getEffectiveAcademicYearId())) {
            throw new ResourceNotFoundException("Academic year not found with id: " + request.getEffectiveAcademicYearId());
        }

        Curriculum entity = mapper.toEntity(request);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        Curriculum saved = repository.save(entity);
        return mapper.toResponse(saved, List.of());
    }

    @Transactional(readOnly = true)
    public List<CurriculumResponse> getAll(Long programId, Long semesterId, Long effectiveAcademicYearId, Boolean isActive) {
        return repository.searchAndFilter(programId, semesterId, effectiveAcademicYearId, isActive).stream()
                .map(curr -> {
                    List<CurriculumCourse> courses = curriculumCourseRepository.findByCurriculumId(curr.getId());
                    return mapper.toResponse(curr, courses);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CurriculumResponse getById(Long id) {
        Curriculum entity = repository.findById(id).orElseThrow(() -> new CurriculumNotFoundException(id));
        List<CurriculumCourse> courses = curriculumCourseRepository.findByCurriculumId(id);
        return mapper.toResponse(entity, courses);
    }

    @Transactional
    public CurriculumResponse update(Long id, CurriculumUpdateRequest request) {
        Curriculum entity = repository.findById(id).orElseThrow(() -> new CurriculumNotFoundException(id));

        if (request.getProgramId() != null && !programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        if (request.getSemesterId() != null && !semesterRepository.existsById(request.getSemesterId())) {
            throw new ResourceNotFoundException("Semester not found with id: " + request.getSemesterId());
        }

        if (request.getEffectiveAcademicYearId() != null && !academicYearRepository.existsById(request.getEffectiveAcademicYearId())) {
            throw new ResourceNotFoundException("Academic year not found with id: " + request.getEffectiveAcademicYearId());
        }

        mapper.updateEntity(entity, request);
        Curriculum saved = repository.save(entity);
        List<CurriculumCourse> courses = curriculumCourseRepository.findByCurriculumId(id);
        return mapper.toResponse(saved, courses);
    }

    @Transactional
    public CurriculumCourseResponse assignCourse(Long curriculumId, CurriculumCourseAssignRequest request) {
        Curriculum curriculum = repository.findById(curriculumId)
                .orElseThrow(() -> new CurriculumNotFoundException(curriculumId));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CourseNotFoundException(request.getCourseId()));

        if (curriculumCourseRepository.existsByCurriculumIdAndCourseId(curriculumId, request.getCourseId())) {
            throw new BusinessException("Course " + course.getCode() + " is already assigned to this curriculum");
        }

        int credits = request.getCredits() != null ? request.getCredits() : course.getCredits();

        CurriculumCourse curriculumCourse = CurriculumCourse.builder()
                .curriculumId(curriculumId)
                .courseId(course.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .classification(request.getClassification().trim().toUpperCase())
                .credits(credits)
                .build();

        CurriculumCourse savedCourse = curriculumCourseRepository.save(curriculumCourse);

        // Recalculate totalCredits
        int newTotal = curriculumCourseRepository.findByCurriculumId(curriculumId).stream()
                .mapToInt(CurriculumCourse::getCredits)
                .sum();
        curriculum.setTotalCredits(newTotal);
        repository.save(curriculum);

        return mapper.toCourseResponse(savedCourse);
    }

    @Transactional(readOnly = true)
    public List<CurriculumCourseResponse> getCourses(Long curriculumId) {
        if (!repository.existsById(curriculumId)) {
            throw new CurriculumNotFoundException(curriculumId);
        }
        return curriculumCourseRepository.findByCurriculumId(curriculumId).stream()
                .map(mapper::toCourseResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeCourse(Long curriculumId, Long courseId) {
        Curriculum curriculum = repository.findById(curriculumId)
                .orElseThrow(() -> new CurriculumNotFoundException(curriculumId));

        if (!curriculumCourseRepository.existsByCurriculumIdAndCourseId(curriculumId, courseId)) {
            throw new ResourceNotFoundException("Course " + courseId + " is not assigned to curriculum " + curriculumId);
        }

        curriculumCourseRepository.deleteByCurriculumIdAndCourseId(curriculumId, courseId);

        int newTotal = curriculumCourseRepository.findByCurriculumId(curriculumId).stream()
                .filter(c -> !c.getCourseId().equals(courseId))
                .mapToInt(CurriculumCourse::getCredits)
                .sum();
        curriculum.setTotalCredits(newTotal);
        repository.save(curriculum);
    }

    @Transactional
    public CurriculumResponse deactivate(Long id) {
        Curriculum entity = repository.findById(id).orElseThrow(() -> new CurriculumNotFoundException(id));
        entity.setIsActive(false);
        Curriculum saved = repository.save(entity);
        return mapper.toResponse(saved, curriculumCourseRepository.findByCurriculumId(id));
    }

    @Transactional
    public CurriculumResponse activate(Long id) {
        Curriculum entity = repository.findById(id).orElseThrow(() -> new CurriculumNotFoundException(id));
        entity.setIsActive(true);
        Curriculum saved = repository.save(entity);
        return mapper.toResponse(saved, curriculumCourseRepository.findByCurriculumId(id));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new CurriculumNotFoundException(id);
        }
        curriculumCourseRepository.deleteByCurriculumId(id);
        repository.deleteById(id);
    }
}
