package com.erp.academic.program.service;

import com.erp.academic.program.dto.ProgramCreateRequest;
import com.erp.academic.program.dto.ProgramResponse;
import com.erp.academic.program.dto.ProgramUpdateRequest;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.exception.ProgramNotFoundException;
import com.erp.academic.program.mapper.ProgramMapper;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository repository;
    private final DepartmentRepository departmentRepository;
    private final ProgramMapper mapper;

    @Transactional
    public ProgramResponse create(ProgramCreateRequest request) {
        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        if (repository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BusinessException("Program code '" + request.getCode() + "' already exists");
        }

        Program entity = mapper.toEntity(request);
        entity.setCode(request.getCode().trim().toUpperCase());
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<ProgramResponse> getAll(String search, Long departmentId, String degree, Boolean isActive) {
        return repository.searchAndFilter(search, departmentId, degree, isActive).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProgramResponse getById(Long id) {
        Program entity = repository.findById(id).orElseThrow(() -> new ProgramNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public ProgramResponse update(Long id, ProgramUpdateRequest request) {
        Program entity = repository.findById(id).orElseThrow(() -> new ProgramNotFoundException(id));

        if (request.getDepartmentId() != null && !departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        if (request.getCode() != null) {
            String updatedCode = request.getCode().trim().toUpperCase();
            if (repository.existsByCodeAndIdNot(updatedCode, id)) {
                throw new BusinessException("Program code '" + updatedCode + "' already exists");
            }
            request.setCode(updatedCode);
        }

        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public ProgramResponse deactivate(Long id) {
        Program entity = repository.findById(id).orElseThrow(() -> new ProgramNotFoundException(id));
        entity.setIsActive(false);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public ProgramResponse activate(Long id) {
        Program entity = repository.findById(id).orElseThrow(() -> new ProgramNotFoundException(id));
        entity.setIsActive(true);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ProgramNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
