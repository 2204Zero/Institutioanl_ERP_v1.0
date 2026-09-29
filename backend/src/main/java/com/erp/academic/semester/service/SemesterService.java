package com.erp.academic.semester.service;

import com.erp.academic.semester.dto.*;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.exception.SemesterNotFoundException;
import com.erp.academic.semester.mapper.SemesterMapper;
import com.erp.academic.semester.repository.SemesterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SemesterService {
    private final SemesterRepository repository;
    private final SemesterMapper mapper;

    public SemesterService(SemesterRepository repository, SemesterMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public SemesterResponse create(SemesterCreateRequest request) {
        Semester entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<SemesterResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SemesterResponse getById(Long id) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public SemesterResponse update(Long id, SemesterUpdateRequest request) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SemesterNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
