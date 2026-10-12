package com.erp.academic.course_registration.controller;

import com.erp.academic.course_registration.dto.CourseRegistrationResponse;
import com.erp.academic.course_registration.dto.StudentCourseRegistrationRequest;
import com.erp.academic.course_registration.mapper.CourseRegistrationMapper;
import com.erp.academic.course_registration.service.CourseRegistrationService;
import com.erp.student.entity.Student;
import com.erp.student.service.StudentIdentityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students/me/course-registrations")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student Course Registration", description = "Student self-service course registration APIs")
@RequiredArgsConstructor
public class StudentCourseRegistrationController {

    private final CourseRegistrationService registrationService;
    private final CourseRegistrationMapper registrationMapper;
    private final StudentIdentityService studentIdentityService;

    @GetMapping
    @Operation(summary = "Get My Registrations", description = "Retrieves course registrations for the authenticated student")
    public ResponseEntity<List<CourseRegistrationResponse>> getMyRegistrations() {
        Student student = studentIdentityService.getCurrentStudent();
        List<CourseRegistrationResponse> responses = registrationService.getByStudentId(student.getId())
                .stream()
                .map(registrationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(summary = "Register Course", description = "Registers the authenticated student for a course offering and section")
    public ResponseEntity<CourseRegistrationResponse> registerCourse(
            @Valid @RequestBody StudentCourseRegistrationRequest request) {
        Student student = studentIdentityService.getCurrentStudent();
        CourseRegistrationResponse response = registrationMapper.toResponse(
                registrationService.registerStudent(student.getId(), request.getCourseOfferingId(), request.getSectionId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{registrationId}")
    @Operation(summary = "Withdraw Course Registration", description = "Withdraws the authenticated student from a course registration")
    public ResponseEntity<CourseRegistrationResponse> withdrawRegistration(@PathVariable Long registrationId) {
        Student student = studentIdentityService.getCurrentStudent();
        CourseRegistrationResponse response = registrationMapper.toResponse(
                registrationService.withdrawStudentRegistration(registrationId, student.getId()));
        return ResponseEntity.ok(response);
    }
}
