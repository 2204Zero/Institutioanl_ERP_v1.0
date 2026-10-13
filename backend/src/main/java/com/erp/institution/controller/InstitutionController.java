package com.erp.institution.controller;

import com.erp.institution.dto.*;
import com.erp.institution.service.InstitutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/institutions")
public class InstitutionController {
    private final InstitutionService service;

    public InstitutionController(InstitutionService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<InstitutionResponse> create(@RequestBody InstitutionCreateRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<InstitutionResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<InstitutionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<InstitutionResponse> update(@PathVariable Long id, @RequestBody InstitutionUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
