package com.erp.guardian.service;

import com.erp.guardian.dto.*;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.exception.GuardianNotFoundException;
import com.erp.guardian.mapper.GuardianMapper;
import com.erp.guardian.repository.GuardianRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuardianService {
    private final GuardianRepository repository;
    private final GuardianMapper mapper;

    public GuardianResponse create(GuardianCreateRequest request) {
        Guardian entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<GuardianResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public GuardianResponse getById(Long id) {
        Guardian entity = repository.findById(id).orElseThrow(() -> new GuardianNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public GuardianResponse update(Long id, GuardianUpdateRequest request) {
        Guardian entity = repository.findById(id).orElseThrow(() -> new GuardianNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new GuardianNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
