package com.erp.student.service;

import com.erp.student.dto.*;
import com.erp.student.entity.Student;
import com.erp.student.exception.StudentNotFoundException;
import com.erp.student.mapper.StudentMapper;
import com.erp.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository repository;
    private final StudentMapper mapper;

    public StudentResponse create(StudentCreateRequest request) {
        Student entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    public List<StudentResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public StudentResponse getById(Long id) {
        Student entity = repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
        return mapper.toResponse(entity);
    }

    public StudentResponse update(Long id, StudentUpdateRequest request) {
        Student entity = repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
        // map updates
        return mapper.toResponse(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new StudentNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
