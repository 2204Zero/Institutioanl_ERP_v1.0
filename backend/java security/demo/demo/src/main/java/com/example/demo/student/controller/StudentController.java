package com.example.demo.student.controller;

import com.example.demo.student.dto.StudentCreateRequest;
import com.example.demo.student.dto.StudentResponse;
import com.example.demo.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@Tag(name = "Student Management", description = "Protected Student APIs with Role-Based and Permission-Based Access Controls")
@SecurityRequirement(name = "BearerAuth")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student profile by ID", description = "Requires STUDENT_PROFILE_READ authority or ADMIN role")
    @PreAuthorize("hasAuthority('STUDENT_PROFILE_READ') or hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StudentResponse> getStudentProfile(@PathVariable Long id) {
        StudentResponse response = studentService.getStudentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List all students", description = "Requires ADMIN, SUPER_ADMIN, or FACULTY role")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY')")
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping
    @Operation(summary = "Create a new student record", description = "Requires ADMIN or SUPER_ADMIN role")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentCreateRequest request) {
        StudentResponse created = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
