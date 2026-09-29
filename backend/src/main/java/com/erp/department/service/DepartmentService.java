package com.erp.department.service;

import com.erp.department.dto.*;
import com.erp.department.entity.Department;
import com.erp.department.exception.DepartmentNotFoundException;
import com.erp.department.mapper.DepartmentMapper;
import com.erp.department.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {
    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;


    public DepartmentService(DepartmentRepository repository, DepartmentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public DepartmentResponse create(DepartmentCreateRequest request) {
        Department entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<DepartmentResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public DepartmentResponse getById(Long id) {
        Department entity = repository.findById(id).orElseThrow(() -> new DepartmentNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public DepartmentResponse update(Long id, DepartmentUpdateRequest request) {
        Department entity = repository.findById(id).orElseThrow(() -> new DepartmentNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new DepartmentNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
