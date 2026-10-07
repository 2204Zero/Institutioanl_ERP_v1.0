package com.erp.campus.service;

import com.erp.campus.dto.*;
import com.erp.campus.entity.Campus;
import com.erp.campus.exception.CampusNotFoundException;
import com.erp.campus.mapper.CampusMapper;
import com.erp.campus.repository.CampusRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CampusService {
    private final CampusRepository repository;
    private final CampusMapper mapper;


    public CampusService(CampusRepository repository, CampusMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public CampusResponse create(CampusCreateRequest request) {
        Campus entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<CampusResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public CampusResponse getById(Long id) {
        Campus entity = repository.findById(id).orElseThrow(() -> new CampusNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public CampusResponse update(Long id, CampusUpdateRequest request) {
        Campus entity = repository.findById(id).orElseThrow(() -> new CampusNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new CampusNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
