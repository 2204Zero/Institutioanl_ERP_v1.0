package com.erp.academic.subject.service;

import com.erp.academic.subject.dto.*;
import com.erp.academic.subject.entity.Subject;
import com.erp.academic.subject.exception.SubjectNotFoundException;
import com.erp.academic.subject.mapper.SubjectMapper;
import com.erp.academic.subject.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class SubjectService {
    private final SubjectRepository repository;
    private final SubjectMapper mapper;

    @Transactional
    public SubjectResponse create(SubjectCreateRequest request) {
        Subject entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getAll() {
        return repository.findAll().stream()
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
        mapper.updateEntity(entity, request);
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
