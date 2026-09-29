package com.erp.academic.semester.controller;

import com.erp.academic.semester.dto.*;
import com.erp.academic.semester.service.SemesterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/semesters")
public class SemesterController {
    private final SemesterService service;


    public SemesterController(SemesterService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SemesterResponse> create(@Valid @RequestBody SemesterCreateRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SemesterResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SemesterResponse> update(@PathVariable Long id, @Valid @RequestBody SemesterUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
