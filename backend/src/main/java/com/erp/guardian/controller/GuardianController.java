package com.erp.guardian.controller;

import com.erp.guardian.dto.*;
import com.erp.guardian.service.GuardianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/v1/guardians")
@RequiredArgsConstructor
public class GuardianController {
    private final GuardianService service;

    @PostMapping
    public ResponseEntity<GuardianResponse> create(@RequestBody GuardianCreateRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<GuardianResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuardianResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuardianResponse> update(@PathVariable Long id, @RequestBody GuardianUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
