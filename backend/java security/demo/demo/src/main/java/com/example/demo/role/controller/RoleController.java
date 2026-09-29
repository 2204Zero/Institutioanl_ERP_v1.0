package com.example.demo.role.controller;

import com.example.demo.role.dto.RoleAssignmentRequest;
import com.example.demo.role.service.RoleAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/roles")
public class RoleController {

    private final RoleAssignmentService roleAssignmentService;

    public RoleController(RoleAssignmentService roleAssignmentService) {
        this.roleAssignmentService = roleAssignmentService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SECURITY_ADMIN')")
    public ResponseEntity<Void> assignRole(
            @PathVariable Long userId, 
            @Valid @RequestBody RoleAssignmentRequest request) {
        roleAssignmentService.assignRole(userId, request.roleName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roleName}")
    @PreAuthorize("hasAuthority('ROLE_SECURITY_ADMIN')")
    public ResponseEntity<Void> removeRole(
            @PathVariable Long userId, 
            @PathVariable String roleName) {
        roleAssignmentService.removeRole(userId, roleName);
        return ResponseEntity.noContent().build();
    }
}
