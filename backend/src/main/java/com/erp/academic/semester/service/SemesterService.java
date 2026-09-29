package com.erp.academic.semester.service;

import com.erp.academic.semester.dto.*;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.exception.SemesterNotFoundException;
import com.erp.academic.semester.mapper.SemesterMapper;
import com.erp.academic.semester.repository.SemesterRepository;
import org.springframework.stereotype.Service;
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

    public SemesterResponse create(SemesterCreateRequest request) {
        Semester entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<SemesterResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public SemesterResponse getById(Long id) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public SemesterResponse update(Long id, SemesterUpdateRequest request) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SemesterNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
