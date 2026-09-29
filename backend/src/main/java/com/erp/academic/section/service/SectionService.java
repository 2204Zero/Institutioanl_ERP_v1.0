package com.erp.academic.section.service;

import com.erp.academic.section.dto.*;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.exception.SectionNotFoundException;
import com.erp.academic.section.mapper.SectionMapper;
import com.erp.academic.section.repository.SectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {
    private final SectionRepository repository;
    private final SectionMapper mapper;

    @Transactional
    public SectionResponse create(SectionCreateRequest request) {
        Section entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SectionResponse getById(Long id) {
        Section entity = repository.findById(id).orElseThrow(() -> new SectionNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public SectionResponse update(Long id, SectionUpdateRequest request) {
        Section entity = repository.findById(id).orElseThrow(() -> new SectionNotFoundException(id));
        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SectionNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
