package com.erp.attendance.controller;

import com.erp.attendance.dto.AttendanceRecordRequest;
import com.erp.attendance.dto.AttendanceResponse;
import com.erp.attendance.dto.BulkAttendanceRequest;
import com.erp.attendance.dto.SectionAttendanceResponse;
import com.erp.attendance.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance Management", description = "Attendance endpoints protected by role and ownership")
@SecurityRequirement(name = "BearerAuth")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/bulk")
    @Operation(summary = "Take bulk attendance for a section", description = "Restricted to Faculty teaching the section, and Admins")
    @PreAuthorize("(hasRole('FACULTY') or hasAnyRole('ADMIN', 'SUPER_ADMIN')) and @securityOwnershipService.canAccessSectionData(authentication, #request.sectionId())")
    public ResponseEntity<SectionAttendanceResponse> recordBulkAttendance(
            @Valid @RequestBody BulkAttendanceRequest request,
            Authentication authentication) {

        String markedBy = authentication != null ? authentication.getName() : "faculty";
        try {
            SectionAttendanceResponse response = attendanceService.recordBulkAttendance(request, markedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/section/{sectionId}")
    @Operation(summary = "Get attendance for a section by date", description = "Accessible by Faculty assigned to the section, and Admins")
    @PreAuthorize("@securityOwnershipService.canAccessSectionData(authentication, #sectionId)")
    public ResponseEntity<SectionAttendanceResponse> getSectionAttendance(
            @PathVariable Long sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        
        String userEmail = authentication != null ? authentication.getName() : "faculty";
        return ResponseEntity.ok(attendanceService.getAttendanceBySectionAndDate(sectionId, date, userEmail));
    }

    @PostMapping
    @Operation(summary = "Take attendance for a student", description = "Restricted to Faculty with ATTENDANCE_TAKE permission, and Admins")
    @PreAuthorize("hasAuthority('ATTENDANCE_TAKE') or hasRole('FACULTY') or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AttendanceResponse> takeAttendance(
            @Valid @RequestBody AttendanceRecordRequest request,
            Authentication authentication) {

        String markedBy = authentication != null ? authentication.getName() : "faculty";
        try {
            AttendanceResponse response = attendanceService.recordAttendance(request, markedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get attendance for a student", description = "Accessible by Student (own), Parent (linked), Faculty (assigned section), and Admin")
    @PreAuthorize("@securityOwnershipService.canAccessStudentAttendance(authentication, #studentId)")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @GetMapping
    @Operation(summary = "Get all attendance records", description = "Accessible by Admin and Super Admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}
