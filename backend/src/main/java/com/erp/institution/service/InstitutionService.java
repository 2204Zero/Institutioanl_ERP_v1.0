package com.erp.institution.service;

import com.erp.institution.dto.*;
import com.erp.institution.entity.Institution;
import com.erp.institution.exception.InstitutionNotFoundException;
import com.erp.institution.mapper.InstitutionMapper;
import com.erp.institution.repository.InstitutionRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstitutionService {
    private final InstitutionRepository repository;
    private final InstitutionMapper mapper;


    public InstitutionService(InstitutionRepository repository, InstitutionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public InstitutionResponse create(InstitutionCreateRequest request) {
        Institution entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<InstitutionResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public InstitutionResponse getById(Long id) {
        Institution entity = repository.findById(id).orElseThrow(() -> new InstitutionNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public InstitutionResponse update(Long id, InstitutionUpdateRequest request) {
        Institution entity = repository.findById(id).orElseThrow(() -> new InstitutionNotFoundException(id));
        if (request.name() != null) {
            entity.setName(request.name());
        }
        if (request.code() != null) {
            entity.setCode(request.code());
        }
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new InstitutionNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
