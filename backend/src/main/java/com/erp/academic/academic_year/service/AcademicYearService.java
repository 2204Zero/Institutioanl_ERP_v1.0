package com.erp.academic.academic_year.service;

import com.erp.academic.academic_year.dto.*;
import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.exception.AcademicYearNotFoundException;
import com.erp.academic.academic_year.mapper.AcademicYearMapper;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicYearService {
    private final AcademicYearRepository repository;
    private final AcademicYearMapper mapper;


    public AcademicYearService(AcademicYearRepository repository, AcademicYearMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public AcademicYearResponse create(AcademicYearCreateRequest request) {
        AcademicYear entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<AcademicYearResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public AcademicYearResponse getById(Long id) {
        AcademicYear entity = repository.findById(id).orElseThrow(() -> new AcademicYearNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public AcademicYearResponse update(Long id, AcademicYearUpdateRequest request) {
        AcademicYear entity = repository.findById(id).orElseThrow(() -> new AcademicYearNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AcademicYearNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
