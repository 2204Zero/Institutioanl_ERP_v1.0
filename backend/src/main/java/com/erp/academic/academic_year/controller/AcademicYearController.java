package com.erp.academic.academic_year.controller;

import com.erp.academic.academic_year.dto.*;
import com.erp.academic.academic_year.service.AcademicYearService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic-years")
public class AcademicYearController {
    private final AcademicYearService service;


    public AcademicYearController(AcademicYearService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AcademicYearResponse> create(@RequestBody AcademicYearCreateRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<AcademicYearResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicYearResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYearResponse> update(@PathVariable Long id, @RequestBody AcademicYearUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
