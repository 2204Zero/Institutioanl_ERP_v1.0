package com.erp.department.controller;

import com.erp.department.dto.*;
import com.erp.department.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

import com.erp.faculty.repository.FacultyRepository;
import com.erp.auth.repository.UserRepository;
import com.erp.admin.controller.AdminFacultyController;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {
    private final DepartmentService service;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;

    public DepartmentController(DepartmentService service,
                                FacultyRepository facultyRepository,
                                UserRepository userRepository) {
        this.service = service;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DepartmentResponse> create(@RequestBody DepartmentCreateRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<DepartmentResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<DepartmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/faculty")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    public ResponseEntity<List<AdminFacultyController.FacultySummary>> getDepartmentFaculty(@PathVariable Long id) {
        DepartmentResponse dept = service.getById(id);
        List<com.erp.faculty.entity.Faculty> facultyList = facultyRepository.findByDepartmentId(id);
        List<AdminFacultyController.FacultySummary> summaries = facultyList.stream()
                .map(f -> {
                    String username = userRepository.findByEmailIgnoreCase(f.getOfficialEmail())
                            .map(com.erp.auth.entity.AppUser::getUsername)
                            .orElse(f.getFirstName() + " " + f.getLastName());
                    return new AdminFacultyController.FacultySummary(
                            f.getId(),
                            f.getFirstName(),
                            f.getLastName(),
                            f.getOfficialEmail(),
                            username,
                            f.getDepartmentId(),
                            dept.name(),
                            f.getIsActive()
                    );
                })
                .toList();
        return ResponseEntity.ok(summaries);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id, @RequestBody DepartmentUpdateRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
