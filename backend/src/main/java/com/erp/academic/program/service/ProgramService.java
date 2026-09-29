package com.erp.academic.program.service;

import com.erp.academic.program.dto.*;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.exception.ProgramNotFoundException;
import com.erp.academic.program.mapper.ProgramMapper;
import com.erp.academic.program.repository.ProgramRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgramService {
    private final ProgramRepository repository;
    private final ProgramMapper mapper;


    public ProgramService(ProgramRepository repository, ProgramMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ProgramResponse create(ProgramCreateRequest request) {
        Program entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<ProgramResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public ProgramResponse getById(Long id) {
        Program entity = repository.findById(id).orElseThrow(() -> new ProgramNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public ProgramResponse update(Long id, ProgramUpdateRequest request) {
        Program entity = repository.findById(id).orElseThrow(() -> new ProgramNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ProgramNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
