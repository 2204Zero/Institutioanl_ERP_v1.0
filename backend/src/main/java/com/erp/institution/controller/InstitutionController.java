package com.erp.institution.controller;

import com.erp.institution.dto.InstitutionResponse;
import com.erp.institution.service.InstitutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/institutions")
@Tag(name = "Institution Management", description = "Protected Institution APIs requiring Administrative roles")
@SecurityRequirement(name = "BearerAuth")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @GetMapping("/details")
    @Operation(summary = "Get institution details", description = "Requires INSTITUTION_READ permission or ADMIN/FACULTY role")
    @PreAuthorize("hasAuthority('INSTITUTION_READ') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    public ResponseEntity<InstitutionResponse> getDetails() {
        return ResponseEntity.ok(institutionService.getInstitutionDetails());
    }

    @PutMapping("/details")
    @Operation(summary = "Update institution settings", description = "Requires INSTITUTION_MANAGE permission or SUPER_ADMIN role")
    @PreAuthorize("hasAuthority('INSTITUTION_MANAGE') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<InstitutionResponse> updateDetails(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Apex Institute of Technology and Management");
        String address = payload.getOrDefault("address", "Knowledge Park, Phase II");
        String website = payload.getOrDefault("website", "https://www.apexinstitute.edu");
        return ResponseEntity.ok(institutionService.updateInstitution(name, address, website));
    }

    @GetMapping("/campuses")
    @Operation(summary = "Get list of campuses", description = "Requires ADMIN or SUPER_ADMIN role")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<String>> getCampuses() {
        return ResponseEntity.ok(institutionService.getInstitutionDetails().campuses());
    }
}

