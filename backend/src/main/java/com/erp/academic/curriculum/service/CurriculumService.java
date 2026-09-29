package com.erp.academic.curriculum.service;

import com.erp.academic.curriculum.dto.*;
import com.erp.academic.curriculum.entity.Curriculum;
import com.erp.academic.curriculum.exception.CurriculumNotFoundException;
import com.erp.academic.curriculum.mapper.CurriculumMapper;
import com.erp.academic.curriculum.repository.CurriculumRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class CurriculumService {
    private final CurriculumRepository repository;
    private final CurriculumMapper mapper;

    @Transactional
    public CurriculumResponse create(CurriculumCreateRequest request) {
        Curriculum entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<CurriculumResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CurriculumResponse getById(Long id) {
        Curriculum entity = repository.findById(id).orElseThrow(() -> new CurriculumNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public CurriculumResponse update(Long id, CurriculumUpdateRequest request) {
        Curriculum entity = repository.findById(id).orElseThrow(() -> new CurriculumNotFoundException(id));
        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new CurriculumNotFoundException(id);
        }
        repository.deleteById(id);
    }

    public CurriculumService(CurriculumRepository repository, CurriculumMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
}
