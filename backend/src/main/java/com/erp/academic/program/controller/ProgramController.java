package com.erp.academic.program.controller;

import com.erp.academic.program.dto.ProgramCreateRequest;
import com.erp.academic.program.dto.ProgramResponse;
import com.erp.academic.program.dto.ProgramUpdateRequest;
import com.erp.academic.program.service.ProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/programs")
public class ProgramController {

    private final ProgramService service;


    public ProgramController(ProgramService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProgramResponse> create(@Valid @RequestBody ProgramCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ProgramResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String degree,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(service.getAll(search, departmentId, degree, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProgramUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ProgramResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(service.deactivate(id));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ProgramResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(service.activate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
