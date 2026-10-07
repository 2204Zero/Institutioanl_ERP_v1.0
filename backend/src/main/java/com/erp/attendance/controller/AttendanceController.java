package com.erp.attendance.controller;

import com.erp.attendance.dto.AttendanceRecordRequest;
import com.erp.attendance.dto.AttendanceResponse;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance Management", description = "Attendance endpoints protected by Faculty role and ATTENDANCE_TAKE permission")
@SecurityRequirement(name = "BearerAuth")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @Operation(summary = "Take attendance for a student", description = "Restricted to Faculty with ATTENDANCE_TAKE permission")
    @PreAuthorize("hasAuthority('ATTENDANCE_TAKE') or hasRole('FACULTY')")
    public ResponseEntity<AttendanceResponse> takeAttendance(
            @Valid @RequestBody AttendanceRecordRequest request,
            Authentication authentication) {

        String markedBy = authentication != null ? authentication.getName() : "faculty";
        AttendanceResponse response = attendanceService.recordAttendance(request, markedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get attendance for a student", description = "Accessible by Student, Parent, Faculty, and Admin")
    @PreAuthorize("hasAnyAuthority('STUDENT_ATTENDANCE_READ', 'ATTENDANCE_READ') or hasAnyRole('STUDENT', 'PARENT', 'FACULTY', 'ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @GetMapping
    @Operation(summary = "Get all attendance records", description = "Accessible by Faculty, Admin, and Super Admin")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}

