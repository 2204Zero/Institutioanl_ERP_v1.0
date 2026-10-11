package com.erp.academic.course.controller;

import com.erp.academic.course.dto.CourseCreateRequest;
import com.erp.academic.course.dto.CourseResponse;
import com.erp.academic.course.dto.CourseUpdateRequest;
import com.erp.academic.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<CourseResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) String courseType,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(service.getAll(search, departmentId, programId, courseType, isActive));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<CourseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CourseUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(service.deactivate(id));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(service.activate(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
