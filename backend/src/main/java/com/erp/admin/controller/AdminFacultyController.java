package com.erp.admin.controller;

import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/faculty")
@Tag(name = "Faculty Management (Admin)", description = "Admin endpoints for managing faculty domain records")
public class AdminFacultyController {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminFacultyController(FacultyRepository facultyRepository, 
                                  UserRepository userRepository,
                                  DepartmentRepository departmentRepository,
                                  PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record FacultySummary(
            Long id, 
            String firstName, 
            String lastName, 
            String email, 
            String username,
            Long departmentId,
            String departmentName,
            Boolean isActive
    ) {}

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public record CreateFacultyRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String officialEmail,
            Long departmentId,
            String username,
            String password,
            String designation,
            String phone
    ) {
        public CreateFacultyRequest(String firstName, String lastName, String officialEmail, Long departmentId, String username, String password) {
            this(firstName, lastName, officialEmail, departmentId, username, password, null, null);
        }
    }

    public record AssignDepartmentRequest(Long departmentId) {}

    @GetMapping
    @Operation(summary = "List all faculty domain records", description = "Restricted to Administrators")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<FacultySummary>> listFaculty() {
        List<FacultySummary> faculty = facultyRepository.findAll().stream()
                .map(this::mapToSummary)
                .toList();
        return ResponseEntity.ok(faculty);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get faculty details by ID", description = "Restricted to Administrators")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<FacultySummary> getFacultyById(@PathVariable Long id) {
        Faculty f = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
        return ResponseEntity.ok(mapToSummary(f));
    }

    @PostMapping
    @Operation(summary = "Create faculty member", description = "Provisions faculty record and optional user account")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> createFaculty(@Valid @RequestBody CreateFacultyRequest request) {
        if (facultyRepository.existsByOfficialEmailIgnoreCase(request.officialEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Faculty domain record already exists for email: " + request.officialEmail()));
        }

        if (request.departmentId() != null && !departmentRepository.existsById(request.departmentId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Department not found with id: " + request.departmentId()));
        }

        Long userId = null;
        if (request.username() != null && !request.username().trim().isEmpty() &&
            request.password() != null && !request.password().trim().isEmpty()) {
            if (userRepository.existsByUsernameIgnoreCase(request.username())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Username already exists: " + request.username()));
            }
            AppUser user = new AppUser(
                    request.username().trim(),
                    passwordEncoder.encode(request.password()),
                    request.officialEmail().trim().toLowerCase(),
                    Role.FACULTY,
                    true
            );
            user = userRepository.save(user);
            userId = user.getId();
        }

        Faculty faculty = Faculty.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .officialEmail(request.officialEmail().trim().toLowerCase())
                .departmentId(request.departmentId())
                .userId(userId)
                .isActive(true)
                .build();
        faculty = facultyRepository.save(faculty);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToSummary(faculty));
    }

    @PatchMapping("/{id}/department")
    @Operation(summary = "Assign faculty to department", description = "Restricted to Administrators")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> assignDepartment(
            @PathVariable Long id,
            @RequestBody AssignDepartmentRequest request) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));

        if (request.departmentId() != null && !departmentRepository.existsById(request.departmentId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Department not found with id: " + request.departmentId()));
        }

        faculty.setDepartmentId(request.departmentId());
        faculty = facultyRepository.save(faculty);

        return ResponseEntity.ok(mapToSummary(faculty));
    }

    private FacultySummary mapToSummary(Faculty f) {
        String username = userRepository.findByEmailIgnoreCase(f.getOfficialEmail())
                .map(AppUser::getUsername)
                .orElse(f.getFirstName() + " " + f.getLastName());
        String deptName = null;
        if (f.getDepartmentId() != null) {
            deptName = departmentRepository.findById(f.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }
        return new FacultySummary(
                f.getId(), 
                f.getFirstName(), 
                f.getLastName(), 
                f.getOfficialEmail(), 
                username,
                f.getDepartmentId(),
                deptName,
                f.getIsActive()
        );
    }
}
