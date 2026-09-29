package com.erp.academic.course.service;

import com.erp.academic.course.dto.*;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.exception.CourseNotFoundException;
import com.erp.academic.course.mapper.CourseMapper;
import com.erp.academic.course.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository repository;
    private final CourseMapper mapper;

    @Transactional
    public CourseResponse create(CourseCreateRequest request) {
        Course entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAll() {
        return repository.findAll().stream()
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
        mapper.updateEntity(entity, request);
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
