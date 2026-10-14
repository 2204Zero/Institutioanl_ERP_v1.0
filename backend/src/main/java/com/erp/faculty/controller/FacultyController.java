package com.erp.faculty.controller;

import com.erp.academic.section.dto.SectionResponse;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.faculty.service.FacultyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/faculty")
@Tag(name = "Faculty Dashboard", description = "Endpoints for faculty members to access their own data")
public class FacultyController {
    
    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get my profile", description = "Returns the profile of the currently authenticated faculty member")
    public ResponseEntity<com.erp.faculty.dto.FacultyProfileResponse> getMyProfile() {
        return ResponseEntity.ok(facultyService.getMyProfile());
    }

    @GetMapping("/me/sections")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get my sections", description = "Returns the sections assigned to the currently authenticated faculty member")
    public ResponseEntity<List<SectionResponse>> getMySections() {
        return ResponseEntity.ok(facultyService.getMySections());
    }

    @GetMapping("/me/timetable")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Get my timetable", description = "Returns the active timetable slots for the currently authenticated faculty member")
    public ResponseEntity<List<TimetableSlot>> getMyTimetable() {
        return ResponseEntity.ok(facultyService.getMyTimetable());
    }
}
