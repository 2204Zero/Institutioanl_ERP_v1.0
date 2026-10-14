package com.erp.academic.course.controller;

import com.erp.academic.course.dto.CoursePrerequisiteResponse;
import com.erp.academic.course.service.CoursePrerequisiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/prerequisites")
@RequiredArgsConstructor
public class CoursePrerequisiteController {

    private final CoursePrerequisiteService prerequisiteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<CoursePrerequisiteResponse>> getPrerequisites(@PathVariable Long courseId) {
        return ResponseEntity.ok(prerequisiteService.getPrerequisites(courseId));
    }

    @PostMapping("/{prerequisiteCourseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CoursePrerequisiteResponse> addPrerequisite(
            @PathVariable Long courseId,
            @PathVariable Long prerequisiteCourseId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prerequisiteService.addPrerequisiteDto(courseId, prerequisiteCourseId));
    }

    @DeleteMapping("/{prerequisiteCourseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> removePrerequisite(
            @PathVariable Long courseId,
            @PathVariable Long prerequisiteCourseId) {
        prerequisiteService.removePrerequisite(courseId, prerequisiteCourseId);
        return ResponseEntity.noContent().build();
    }
}
