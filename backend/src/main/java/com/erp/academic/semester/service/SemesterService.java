package com.erp.academic.semester.service;

import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.semester.dto.SemesterCreateRequest;
import com.erp.academic.semester.dto.SemesterResponse;
import com.erp.academic.semester.dto.SemesterUpdateRequest;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.exception.SemesterNotFoundException;
import com.erp.academic.semester.mapper.SemesterMapper;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository repository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterMapper mapper;

    @Transactional
    public SemesterResponse create(SemesterCreateRequest request) {
        if (!academicYearRepository.existsById(request.getAcademicYearId())) {
            throw new ResourceNotFoundException("Academic year not found with id: " + request.getAcademicYearId());
        }

        if (request.getStartDate().isAfter(request.getEndDate()) || request.getStartDate().isEqual(request.getEndDate())) {
            throw new ValidationException("Start date must be before end date");
        }

        if (repository.existsByAcademicYearIdAndSemesterNumber(request.getAcademicYearId(), request.getSemesterNumber())) {
            throw new BusinessException("Semester number " + request.getSemesterNumber() + " already exists for academic year " + request.getAcademicYearId());
        }

        Semester entity = mapper.toEntity(request);
        if (entity.getIsActive() == null) {
            entity.setIsActive(true);
        }
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<SemesterResponse> getAll(Long academicYearId, Boolean isActive) {
        return repository.findByFilters(academicYearId, isActive).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SemesterResponse getById(Long id) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        return mapper.toResponse(entity);
    }

    @Transactional
    public SemesterResponse update(Long id, SemesterUpdateRequest request) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));

        Long targetAcademicYearId = request.getAcademicYearId() != null ? request.getAcademicYearId() : entity.getAcademicYearId();
        Integer targetSemesterNumber = request.getSemesterNumber() != null ? request.getSemesterNumber() : entity.getSemesterNumber();
        LocalDate targetStartDate = request.getStartDate() != null ? request.getStartDate() : entity.getStartDate();
        LocalDate targetEndDate = request.getEndDate() != null ? request.getEndDate() : entity.getEndDate();

        if (request.getAcademicYearId() != null && !academicYearRepository.existsById(request.getAcademicYearId())) {
            throw new ResourceNotFoundException("Academic year not found with id: " + request.getAcademicYearId());
        }

        if (targetStartDate != null && targetEndDate != null && (targetStartDate.isAfter(targetEndDate) || targetStartDate.isEqual(targetEndDate))) {
            throw new ValidationException("Start date must be before end date");
        }

        if (repository.existsByAcademicYearIdAndSemesterNumberAndIdNot(targetAcademicYearId, targetSemesterNumber, id)) {
            throw new BusinessException("Semester number " + targetSemesterNumber + " already exists for academic year " + targetAcademicYearId);
        }

        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public SemesterResponse deactivate(Long id) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        entity.setIsActive(false);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public SemesterResponse activate(Long id) {
        Semester entity = repository.findById(id).orElseThrow(() -> new SemesterNotFoundException(id));
        entity.setIsActive(true);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SemesterNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
