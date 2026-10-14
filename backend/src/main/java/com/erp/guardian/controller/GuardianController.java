package com.erp.guardian.controller;

import com.erp.common.response.ApiResponse;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.dto.GuardianResponseDto;
import com.erp.guardian.service.GuardianService;
import com.erp.auth.model.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Guardian Management", description = "APIs for Guardian CRUD and Student Linking (Day 03)")
public class GuardianController {

    private final GuardianService guardianService;

    public GuardianController(GuardianService guardianService) {
        this.guardianService = guardianService;
    }

    @GetMapping({"/guardians/me", "/api/v1/guardians/me"})
    @PreAuthorize("hasRole('PARENT') or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get My Guardian Profiles", description = "Retrieves guardian profiles linked to authenticated user")
    public ResponseEntity<ApiResponse<List<GuardianResponseDto>>> getMyGuardians(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal && principal.getId() != null) {
            List<GuardianResponseDto> list = guardianService.getGuardiansByUserId(principal.getId());
            return ResponseEntity.ok(ApiResponse.success(list));
        }
        String email = authentication != null ? authentication.getName() : null;
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal && principal.getEmail() != null) {
            email = principal.getEmail();
        }
        List<GuardianResponseDto> list = guardianService.getGuardiansByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping({"/guardians", "/api/v1/guardians"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get All Guardians", description = "Retrieves all guardians in the system")
    public ResponseEntity<ApiResponse<List<GuardianResponseDto>>> getAllGuardians() {
        List<GuardianResponseDto> list = guardianService.getAllGuardians();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping({"/guardians/{id}", "/api/v1/guardians/{id}"})
    @PreAuthorize("@securityOwnershipService.canAccessGuardianData(authentication, #id) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get Guardian by ID", description = "Retrieves a guardian by ID")
    public ResponseEntity<ApiResponse<GuardianResponseDto>> getGuardianById(@PathVariable Long id) {
        GuardianResponseDto guardian = guardianService.getGuardianById(id);
        return ResponseEntity.ok(ApiResponse.success(guardian));
    }

    @PostMapping({"/guardians", "/api/v1/guardians"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Add Guardian", description = "Creates a new guardian record, optionally linking to a student")
    public ResponseEntity<ApiResponse<GuardianResponseDto>> createGuardian(@Valid @RequestBody GuardianRequestDto requestDto) {
        GuardianResponseDto created = guardianService.createGuardian(requestDto);
        return new ResponseEntity<>(ApiResponse.success("Guardian created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping({"/guardians/{id}", "/api/v1/guardians/{id}"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Edit Guardian", description = "Updates an existing guardian record")
    public ResponseEntity<ApiResponse<GuardianResponseDto>> updateGuardian(
            @PathVariable Long id,
            @Valid @RequestBody GuardianRequestDto requestDto) {
        GuardianResponseDto updated = guardianService.updateGuardian(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Guardian updated successfully", updated));
    }

    @DeleteMapping({"/guardians/{id}", "/api/v1/guardians/{id}"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete Guardian", description = "Deletes a guardian record")
    public ResponseEntity<ApiResponse<Void>> deleteGuardian(@PathVariable Long id) {
        guardianService.deleteGuardian(id);
        return ResponseEntity.ok(ApiResponse.success("Guardian deleted successfully", null));
    }

    @GetMapping("/api/v1/students/{studentId}/guardians")
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    @Operation(summary = "Get Guardians for Student", description = "Retrieves all guardians linked to a specific student")
    public ResponseEntity<ApiResponse<List<GuardianResponseDto>>> getGuardiansByStudent(@PathVariable Long studentId) {
        List<GuardianResponseDto> list = guardianService.getGuardiansByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/api/v1/students/{studentId}/guardians")
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Add and Link Guardian to Student", description = "Directly creates and links a guardian to a specific student")
    public ResponseEntity<ApiResponse<GuardianResponseDto>> addGuardianToStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody GuardianRequestDto requestDto) {
        GuardianResponseDto created = guardianService.addGuardianToStudent(studentId, requestDto);
        return new ResponseEntity<>(ApiResponse.success("Guardian added and linked to student", created), HttpStatus.CREATED);
    }

    @PostMapping("/api/v1/students/{studentId}/guardians/{guardianId}/link")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Link Existing Guardian to Student", description = "Links an existing guardian to a student")
    public ResponseEntity<ApiResponse<GuardianResponseDto>> linkGuardianToStudent(
            @PathVariable Long studentId,
            @PathVariable Long guardianId) {
        GuardianResponseDto updated = guardianService.linkGuardianToStudent(studentId, guardianId);
        return ResponseEntity.ok(ApiResponse.success("Guardian successfully linked to student", updated));
    }

    @PostMapping({"/guardians/{id}/students/{studentId}", "/api/v1/guardians/{id}/students/{studentId}"})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Link Student to Guardian", description = "Links a student to an existing guardian")
    public ResponseEntity<ApiResponse<GuardianResponseDto>> linkStudentToGuardian(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        GuardianResponseDto updated = guardianService.linkGuardianToStudent(studentId, id);
        return ResponseEntity.ok(ApiResponse.success("Guardian successfully linked to student", updated));
    }

    @GetMapping({"/guardians/{id}/students", "/api/v1/guardians/{id}/students"})
    @PreAuthorize("@securityOwnershipService.canAccessGuardianData(authentication, #id) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get Linked Wards for Guardian", description = "Retrieves all students linked to this guardian account")
    public ResponseEntity<ApiResponse<List<GuardianResponseDto>>> getGuardianWards(@PathVariable Long id) {
        GuardianResponseDto current = guardianService.getGuardianById(id);
        List<GuardianResponseDto> allProfiles;
        if (current.getUserId() != null) {
            allProfiles = guardianService.getGuardiansByUserId(current.getUserId());
        } else if (current.getEmail() != null && !current.getEmail().isBlank()) {
            allProfiles = guardianService.getGuardiansByEmail(current.getEmail());
        } else {
            allProfiles = List.of(current);
        }
        return ResponseEntity.ok(ApiResponse.success(allProfiles));
    }

    @DeleteMapping("/api/v1/students/{studentId}/guardians/{guardianId}")
    @PreAuthorize("@securityOwnershipService.canAccessStudentData(authentication, #studentId) or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Unlink Guardian from Student", description = "Unlinks a guardian relationship from a student without destroying the guardian account")
    public ResponseEntity<ApiResponse<Void>> unlinkGuardianFromStudent(
            @PathVariable Long studentId,
            @PathVariable Long guardianId) {
        guardianService.unlinkGuardianFromStudent(studentId, guardianId);
        return ResponseEntity.ok(ApiResponse.success("Guardian unlinked successfully from student", null));
    }
}
