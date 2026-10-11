package com.erp.academic.course_registration.controller;

import com.erp.academic.course_registration.entity.CourseRegistration;
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<CourseRegistration>> getRegistrations(@RequestParam Long studentId) {
        return ResponseEntity.ok(registrationService.getByStudentId(studentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseRegistration> registerStudent(
            @RequestParam Long studentId,
            @RequestParam Long courseOfferingId,
            @RequestParam Long sectionId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.registerStudent(studentId, courseOfferingId, sectionId));
    }

    @PatchMapping("/{id}/drop")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseRegistration> dropCourse(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.dropCourse(id));
    }
}
