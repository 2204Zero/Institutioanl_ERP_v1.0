package com.erp.academic.course_registration.controller;

import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.service.CourseRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course-registrations")
@RequiredArgsConstructor
public class CourseRegistrationController {

    private final CourseRegistrationService registrationService;

    @PostMapping
    public ResponseEntity<CourseRegistration> registerStudent(
            @RequestParam Long studentId,
            @RequestParam Long courseOfferingId,
            @RequestParam Long sectionId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.registerStudent(studentId, courseOfferingId, sectionId));
    }

    @PatchMapping("/{id}/drop")
    public ResponseEntity<CourseRegistration> dropCourse(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.dropCourse(id));
    }
}
