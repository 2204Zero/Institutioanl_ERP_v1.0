package com.erp.academic.course_registration.controller;

import com.erp.academic.course_registration.dto.CourseRegistrationResponse;
import com.erp.academic.course_registration.mapper.CourseRegistrationMapper;
import com.erp.academic.course_registration.service.CourseRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/course-registrations")
@RequiredArgsConstructor
public class CourseRegistrationController {

    private final CourseRegistrationService registrationService;
    private final CourseRegistrationMapper registrationMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<CourseRegistrationResponse>> getRegistrations(@RequestParam Long studentId) {
        List<CourseRegistrationResponse> responses = registrationService.getByStudentId(studentId)
                .stream()
                .map(registrationMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseRegistrationResponse> registerStudent(
            @RequestParam Long studentId,
            @RequestParam Long courseOfferingId,
            @RequestParam Long sectionId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationMapper.toResponse(
                        registrationService.registerStudent(studentId, courseOfferingId, sectionId)));
    }

    @PatchMapping("/{id}/drop")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseRegistrationResponse> dropCourse(@PathVariable Long id) {
        return ResponseEntity.ok(
                registrationMapper.toResponse(registrationService.dropCourse(id)));
    }
}
