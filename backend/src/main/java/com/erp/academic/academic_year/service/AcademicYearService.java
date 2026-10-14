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
        validateDates(request.startDate(), request.endDate(), null);
        if (Boolean.TRUE.equals(request.isActive())) {
            validateSingleActiveYear(null);
        }
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
        
        validateDates(request.startDate() != null ? request.startDate() : entity.getStartDate(),
                      request.endDate() != null ? request.endDate() : entity.getEndDate(), id);
        
        if (Boolean.TRUE.equals(request.isActive())) {
            validateSingleActiveYear(id);
        }

        if (request.name() != null) entity.setName(request.name());
        if (request.startDate() != null) entity.setStartDate(request.startDate());
        if (request.endDate() != null) entity.setEndDate(request.endDate());
        if (request.isActive() != null) entity.setIsActive(request.isActive());

        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AcademicYearNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private void validateDates(java.time.LocalDate startDate, java.time.LocalDate endDate, Long excludeId) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        if (startDate != null && endDate != null) {
            List<AcademicYear> overlaps = repository.findOverlapping(startDate, endDate, excludeId);
            if (!overlaps.isEmpty()) {
                AcademicYear conflict = overlaps.get(0);
                throw new IllegalArgumentException(String.format(
                        "Academic year dates cannot overlap with existing year '%s' (%s to %s)",
                        conflict.getName(), conflict.getStartDate(), conflict.getEndDate()));
            }
        }
    }

    private void validateSingleActiveYear(Long excludeId) {
        List<AcademicYear> activeYears = excludeId == null ? 
            repository.findAllActive() : repository.findActiveExcluding(excludeId);
        if (!activeYears.isEmpty()) {
            throw new IllegalArgumentException("Only one academic year can be active at a time");
        }
    }
}
