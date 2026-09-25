package com.erp.student.controller;

import com.erp.common.response.ApiResponse;
import com.erp.common.response.PageResponse;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.dto.StudentResponseDto;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.StudentStatus;
import com.erp.student.entity.StudentStatusHistory;
import com.erp.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@Tag(name = "Student Profile", description = "APIs for Student CRUD, Profile details, and Status Workflow")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    @Operation(summary = "Add Student", description = "Creates a new student profile in the institution")
    public ResponseEntity<ApiResponse<StudentResponseDto>> createStudent(@Valid @RequestBody StudentRequestDto requestDto) {
        StudentResponseDto created = studentService.createStudent(requestDto);
        return new ResponseEntity<>(ApiResponse.success("Student created successfully", created), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List Students", description = "Retrieves paginated and filtered list of students")
    public ResponseEntity<ApiResponse<PageResponse<StudentResponseDto>>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StudentStatus status,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<StudentResponseDto> students = studentService.getAllStudents(page, size, search, status, department, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/{id}")
    @Operation(summary = "View Student by ID", description = "Fetches complete student profile including guardians and documents")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getStudentById(
            @Parameter(description = "Student primary ID") @PathVariable Long id) {
        StudentResponseDto student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @GetMapping("/roll/{rollNumber}")
    @Operation(summary = "View Student by Roll Number", description = "Fetches student profile by their unique roll number")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getStudentByRollNumber(@PathVariable String rollNumber) {
        StudentResponseDto student = studentService.getStudentByRollNumber(rollNumber);
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edit Student", description = "Updates an existing student profile")
    public ResponseEntity<ApiResponse<StudentResponseDto>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequestDto requestDto) {
        StudentResponseDto updated = studentService.updateStudent(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Student", description = "Removes a student profile and associated records")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Student Status", description = "Updates student enrollment status (ACTIVE, INACTIVE, SUSPENDED, GRADUATED, ALUMNI) with audit remarks")
    public ResponseEntity<ApiResponse<StudentResponseDto>> updateStudentStatus(
            @PathVariable Long id,
            @Valid @RequestBody StudentStatusUpdateDto statusUpdateDto) {
        StudentResponseDto updated = studentService.updateStudentStatus(id, statusUpdateDto);
        return ResponseEntity.ok(ApiResponse.success("Student status updated successfully", updated));
    }

    @GetMapping("/{id}/status-history")
    @Operation(summary = "View Student Status History", description = "Returns chronological audit log of status changes for a student")
    public ResponseEntity<ApiResponse<List<StudentStatusHistory>>> getStatusHistory(@PathVariable Long id) {
        List<StudentStatusHistory> history = studentService.getStatusHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
