package com.erp.academic.course.service;

import com.erp.academic.course.dto.CourseCreateRequest;
import com.erp.academic.course.dto.CourseResponse;
import com.erp.academic.course.dto.CourseUpdateRequest;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.exception.CourseNotFoundException;
import com.erp.academic.course.mapper.CourseMapper;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final CourseMapper mapper;

    @Transactional
    public CourseResponse create(CourseCreateRequest request) {
        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        if (request.getProgramId() != null && !programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        String code = request.getCode().trim().toUpperCase();
        if (repository.existsByCode(code)) {
            throw new BusinessException("Course code '" + code + "' already exists");
        }

        Course entity = mapper.toEntity(request);
        entity.setCode(code);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAll(String search, Long departmentId, Long programId, String courseType, Boolean isActive) {
        return repository.searchAndFilter(search, departmentId, programId, courseType, isActive).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getById(Long id) {
        Course entity = repository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public CourseResponse update(Long id, CourseUpdateRequest request) {
        Course entity = repository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));

        if (request.getDepartmentId() != null && !departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        if (request.getProgramId() != null && !programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        if (request.getCode() != null) {
            String updatedCode = request.getCode().trim().toUpperCase();
            if (repository.existsByCodeAndIdNot(updatedCode, id)) {
                throw new BusinessException("Course code '" + updatedCode + "' already exists");
            }
            request.setCode(updatedCode);
        }

        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public CourseResponse deactivate(Long id) {
        Course entity = repository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));
        entity.setIsActive(false);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public CourseResponse activate(Long id) {
        Course entity = repository.findById(id).orElseThrow(() -> new CourseNotFoundException(id));
        entity.setIsActive(true);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new CourseNotFoundException(id);
        }
        repository.deleteById(id);
    }

}
