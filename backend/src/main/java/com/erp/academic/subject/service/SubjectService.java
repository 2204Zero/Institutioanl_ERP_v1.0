package com.erp.academic.subject.service;

import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.academic.subject.dto.SubjectCreateRequest;
import com.erp.academic.subject.dto.SubjectResponse;
import com.erp.academic.subject.dto.SubjectUpdateRequest;
import com.erp.academic.subject.entity.Subject;
import com.erp.academic.subject.exception.SubjectNotFoundException;
import com.erp.academic.subject.mapper.SubjectMapper;
import com.erp.academic.subject.repository.SubjectRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class SubjectService {

    private final SubjectRepository repository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final ProgramRepository programRepository;
    private final SubjectMapper mapper;

    @Transactional
    public SubjectResponse create(SubjectCreateRequest request) {
        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        if (request.getCourseId() != null && !courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course not found with id: " + request.getCourseId());
        }

        if (request.getProgramId() != null && !programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        String code = request.getCode().trim().toUpperCase();
        if (repository.existsByCode(code)) {
            throw new BusinessException("Subject code '" + code + "' already exists");
        }

        Subject entity = mapper.toEntity(request);
        entity.setCode(code);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getAll(String search, Long departmentId, Long courseId, Long programId, Boolean isPractical, Boolean isActive) {
        return repository.searchAndFilter(search, departmentId, courseId, programId, isPractical, isActive).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectResponse getById(Long id) {
        Subject entity = repository.findById(id).orElseThrow(() -> new SubjectNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public SubjectResponse update(Long id, SubjectUpdateRequest request) {
        Subject entity = repository.findById(id).orElseThrow(() -> new SubjectNotFoundException(id));

        if (request.getDepartmentId() != null && !departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        if (request.getCourseId() != null && !courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course not found with id: " + request.getCourseId());
        }

        if (request.getProgramId() != null && !programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        if (request.getCode() != null) {
            String updatedCode = request.getCode().trim().toUpperCase();
            if (repository.existsByCodeAndIdNot(updatedCode, id)) {
                throw new BusinessException("Subject code '" + updatedCode + "' already exists");
            }
            request.setCode(updatedCode);
        }

        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public SubjectResponse deactivate(Long id) {
        Subject entity = repository.findById(id).orElseThrow(() -> new SubjectNotFoundException(id));
        entity.setIsActive(false);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public SubjectResponse activate(Long id) {
        Subject entity = repository.findById(id).orElseThrow(() -> new SubjectNotFoundException(id));
        entity.setIsActive(true);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SubjectNotFoundException(id);
        }
        repository.deleteById(id);
    }

    public SubjectService(SubjectRepository repository, SubjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
}
