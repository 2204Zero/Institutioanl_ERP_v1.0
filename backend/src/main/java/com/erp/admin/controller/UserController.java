package com.erp.admin.controller;

import com.erp.auth.model.InMemoryUserRegistry;
import com.erp.auth.model.Role;
import com.erp.auth.model.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@Tag(name = "User Management (Admin)", description = "Admin endpoints for managing system users, protected by USER_MANAGE permission")
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final InMemoryUserRegistry userRegistry;
    private final PasswordEncoder passwordEncoder;

    public UserController(InMemoryUserRegistry userRegistry, PasswordEncoder passwordEncoder) {
        this.userRegistry = userRegistry;
        this.passwordEncoder = passwordEncoder;
    }

    public record UserSummary(String username, String email, String role) {}

    public record CreateUserRequest(
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String email,
            @NotBlank String role
    ) {}

    @GetMapping
    @Operation(summary = "List system users", description = "Restricted to Administrators with USER_MANAGE permission")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<List<UserSummary>> listUsers() {
        List<UserSummary> users = List.of(
                new UserSummary("superadmin", "superadmin@erp.com", "SUPER_ADMIN"),
                new UserSummary("admin", "admin@erp.com", "ADMIN"),
                new UserSummary("faculty", "faculty@erp.com", "FACULTY"),
                new UserSummary("student", "student@erp.com", "STUDENT"),
                new UserSummary("parent", "parent@erp.com", "PARENT"),
                new UserSummary("finance", "finance@erp.com", "FINANCE")
        );
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @Operation(summary = "Create a new user account", description = "Restricted to Administrators with USER_MANAGE permission")
    @PreAuthorize("hasAuthority('USER_MANAGE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createUser(@RequestBody CreateUserRequest request) {
        Role role = Role.valueOf(request.role().toUpperCase());
        UserPrincipal newUser = UserPrincipal.of(
                request.username(),
                passwordEncoder.encode(request.password()),
                request.email(),
                role
        );
        userRegistry.register(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User " + request.username() + " created successfully with role " + role.name()
        ));
    }
}

