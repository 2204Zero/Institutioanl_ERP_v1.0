package com.erp.academic.curriculum.controller;

import com.erp.academic.curriculum.dto.*;
import com.erp.academic.curriculum.service.CurriculumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/curriculums")
@RequiredArgsConstructor
public class CurriculumController {

    private final CurriculumService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CurriculumResponse> create(@Valid @RequestBody CurriculumCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<CurriculumResponse>> getAll(
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long effectiveAcademicYearId,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(service.getAll(programId, semesterId, effectiveAcademicYearId, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurriculumResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CurriculumResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CurriculumUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CurriculumResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(service.deactivate(id));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CurriculumResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(service.activate(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/courses")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CurriculumCourseResponse> assignCourse(
            @PathVariable Long id,
            @Valid @RequestBody CurriculumCourseAssignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.assignCourse(id, request));
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<CurriculumCourseResponse>> getCourses(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCourses(id));
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> removeCourse(
            @PathVariable Long id,
            @PathVariable Long courseId) {
        service.removeCourse(id, courseId);
        return ResponseEntity.noContent().build();
    }
}
