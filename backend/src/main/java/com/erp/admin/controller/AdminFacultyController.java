package com.erp.admin.controller;

import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.erp.auth.entity.AppUser;
import com.erp.auth.repository.UserRepository;

@RestController
@RequestMapping("/api/v1/admin/faculty")
@Tag(name = "Faculty Management (Admin)", description = "Admin endpoints for managing faculty domain records")
public class AdminFacultyController {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;

    public AdminFacultyController(FacultyRepository facultyRepository, UserRepository userRepository) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
    }

    public record FacultySummary(Long id, String firstName, String lastName, String email, String username) {}

    @GetMapping
    @Operation(summary = "List all faculty domain records", description = "Restricted to Administrators")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<FacultySummary>> listFaculty() {
        List<FacultySummary> faculty = facultyRepository.findAll().stream()
                .map(f -> {
                    String username = userRepository.findByEmailIgnoreCase(f.getOfficialEmail())
                            .map(AppUser::getUsername)
                            .orElse(f.getFirstName() + " " + f.getLastName());
                    return new FacultySummary(f.getId(), f.getFirstName(), f.getLastName(), f.getOfficialEmail(), username);
                })
                .toList();
        return ResponseEntity.ok(faculty);
    }
}
