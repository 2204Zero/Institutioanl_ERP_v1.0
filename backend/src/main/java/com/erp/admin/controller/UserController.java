package com.erp.admin.controller;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@Tag(name = "User Management (Admin)", description = "Admin endpoints for managing system users, protected by USER_MANAGE permission")
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          FacultyRepository facultyRepository,
                          StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
    }

    public record UserSummary(Long id, String username, String email, String role, boolean enabled) {}

    public record CreateUserRequest(
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String email,
            @NotBlank String role,
            String firstName,
            String lastName
    ) {}

    @GetMapping
    @Operation(summary = "List system users", description = "Restricted to Administrators with USER_MANAGE permission")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<UserSummary>> listUsers() {
        List<UserSummary> users = userRepository.findAll().stream()
                .map(user -> new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name(), user.isEnabled()))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @Transactional
    @Operation(summary = "Create a new user account", description = "Restricted to Administrators with USER_MANAGE permission")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> createUser(@RequestBody CreateUserRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username already exists"));
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists"));
        }

        Role role;
        try {
            role = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid role"));
        }

        if (role == Role.FACULTY) {
            if (facultyRepository.existsByOfficialEmailIgnoreCase(request.email())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Faculty domain record already exists for this email"));
            }
            if (request.firstName() == null || request.firstName().trim().isEmpty() ||
                request.lastName() == null || request.lastName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "firstName and lastName are required for FACULTY role"));
            }
        }

        AppUser newUser = new AppUser(
                request.username(),
                passwordEncoder.encode(request.password()),
                request.email(),
                role,
                true
        );
        final AppUser savedUser = userRepository.save(newUser);

        if (role == Role.FACULTY) {
            Faculty faculty = Faculty.builder()
                    .firstName(request.firstName())
                    .lastName(request.lastName())
                    .officialEmail(request.email())
                    .userId(savedUser.getId())
                    .isActive(true)
                    .build();
            facultyRepository.save(faculty);
        } else if (role == Role.STUDENT) {
            studentRepository.findByEmail(request.email().trim().toLowerCase()).ifPresent(student -> {
                if (student.getUserId() == null) {
                    student.setUserId(savedUser.getId());
                    studentRepository.save(student);
                }
            });
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User " + request.username() + " created successfully with role " + role.name()
        ));
    }
}
