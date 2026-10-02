package com.erp.academic.section.controller;

import com.erp.academic.section.dto.*;
import com.erp.academic.section.service.SectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService service;

    @PostMapping
    public ResponseEntity<SectionResponse> create(@Valid @RequestBody SectionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SectionResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(service.getAll(search, batchId, semesterId, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SectionUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<SectionResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(service.deactivate(id));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<SectionResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(service.activate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Student Assignment ====================

    @PostMapping("/{id}/students")
    public ResponseEntity<List<SectionStudentResponse>> assignStudents(
            @PathVariable Long id,
            @Valid @RequestBody SectionStudentAssignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.assignStudents(id, request));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<SectionStudentResponse>> getStudents(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStudents(id));
    }

    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> removeStudent(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        service.removeStudent(id, studentId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Faculty Association ====================

    @PostMapping("/{id}/faculty")
    public ResponseEntity<SectionFacultyResponse> assignFaculty(
            @PathVariable Long id,
            @Valid @RequestBody SectionFacultyAssignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.assignFaculty(id, request));
    }

    @GetMapping("/{id}/faculty")
    public ResponseEntity<List<SectionFacultyResponse>> getFaculty(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFaculty(id));
    }

    @DeleteMapping("/{id}/faculty/{assignmentId}")
    public ResponseEntity<Void> removeFaculty(
            @PathVariable Long id,
            @PathVariable Long assignmentId) {
        service.removeFaculty(id, assignmentId);
        return ResponseEntity.noContent().build();
    }
}
