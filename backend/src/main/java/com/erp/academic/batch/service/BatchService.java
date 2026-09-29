package com.erp.academic.batch.service;

import com.erp.academic.batch.dto.*;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.exception.BatchNotFoundException;
import com.erp.academic.batch.mapper.BatchMapper;
import com.erp.academic.batch.repository.BatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchService {
    private final BatchRepository repository;
    private final BatchMapper mapper;

    public BatchService(BatchRepository repository, BatchMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public BatchResponse create(BatchCreateRequest request) {
        Batch entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<BatchResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BatchResponse getById(Long id) {
        Batch entity = repository.findById(id).orElseThrow(() -> new BatchNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public BatchResponse update(Long id, BatchUpdateRequest request) {
        Batch entity = repository.findById(id).orElseThrow(() -> new BatchNotFoundException(id));
        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new BatchNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
