package com.erp.academic.course_offering.controller;

import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.service.CourseOfferingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/course-offerings")
public class CourseOfferingController {

    private final CourseOfferingService service;

    public CourseOfferingController(CourseOfferingService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_OFFERING_CREATE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseOffering> create(@RequestBody Map<String, Object> payload) {
        Long courseId = ((Number) payload.get("courseId")).longValue();
        Long semesterId = ((Number) payload.get("semesterId")).longValue();
        Integer maxCapacity = ((Number) payload.get("maxCapacity")).intValue();
        return ResponseEntity.ok(service.createCourseOffering(courseId, semesterId, maxCapacity));
    }

    @GetMapping
    public ResponseEntity<List<CourseOffering>> getAll() {
        return ResponseEntity.ok(service.getAllCourseOfferings());
    }
}