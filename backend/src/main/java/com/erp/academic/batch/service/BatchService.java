package com.erp.academic.batch.service;

import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.batch.dto.BatchCreateRequest;
import com.erp.academic.batch.dto.BatchResponse;
import com.erp.academic.batch.dto.BatchUpdateRequest;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.exception.BatchNotFoundException;
import com.erp.academic.batch.mapper.BatchMapper;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchService {

    private final BatchRepository repository;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;
    private final BatchMapper mapper;

    public BatchService(BatchRepository repository, BatchMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public BatchResponse create(BatchCreateRequest request) {
        if (!programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        if (request.getAcademicYearId() != null && !academicYearRepository.existsById(request.getAcademicYearId())) {
            throw new ResourceNotFoundException("Academic year not found with id: " + request.getAcademicYearId());
        }

        if (request.getGraduationYear() < request.getAdmissionYear()) {
            throw new ValidationException("Graduation year must be greater than or equal to admission year");
        }

        String batchCode = request.getCode().trim().toUpperCase();
        if (repository.existsByCode(batchCode)) {
            throw new BusinessException("Batch code '" + batchCode + "' already exists");
        }

        Batch entity = mapper.toEntity(request);
        entity.setCode(batchCode);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }

        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<BatchResponse> getAll(String search, Long programId, Integer admissionYear, Boolean isActive) {
        return repository.searchAndFilter(search, programId, admissionYear, isActive).stream()
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

        if (request.getProgramId() != null && !programRepository.existsById(request.getProgramId())) {
            throw new ResourceNotFoundException("Program not found with id: " + request.getProgramId());
        }

        if (request.getAcademicYearId() != null && !academicYearRepository.existsById(request.getAcademicYearId())) {
            throw new ResourceNotFoundException("Academic year not found with id: " + request.getAcademicYearId());
        }

        Integer admissionYear = request.getAdmissionYear() != null ? request.getAdmissionYear() : entity.getAdmissionYear();
        Integer graduationYear = request.getGraduationYear() != null ? request.getGraduationYear() : entity.getGraduationYear();

        if (graduationYear < admissionYear) {
            throw new ValidationException("Graduation year must be greater than or equal to admission year");
        }

        if (request.getCode() != null) {
            String updatedCode = request.getCode().trim().toUpperCase();
            if (repository.existsByCodeAndIdNot(updatedCode, id)) {
                throw new BusinessException("Batch code '" + updatedCode + "' already exists");
            }
            request.setCode(updatedCode);
        }

        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public BatchResponse deactivate(Long id) {
        Batch entity = repository.findById(id).orElseThrow(() -> new BatchNotFoundException(id));
        entity.setIsActive(false);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public BatchResponse activate(Long id) {
        Batch entity = repository.findById(id).orElseThrow(() -> new BatchNotFoundException(id));
        entity.setIsActive(true);
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
