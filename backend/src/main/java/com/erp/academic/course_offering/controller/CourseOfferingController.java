package com.erp.academic.course_offering.controller;

import com.erp.academic.course_offering.dto.CourseOfferingResponse;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.mapper.CourseOfferingMapper;
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
    private final CourseOfferingMapper mapper;

    public CourseOfferingController(CourseOfferingService service, CourseOfferingMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_OFFERING_CREATE') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<CourseOfferingResponse> create(@RequestBody Map<String, Object> payload) {
        Long courseId = ((Number) payload.get("courseId")).longValue();
        Long semesterId = ((Number) payload.get("semesterId")).longValue();
        Integer maxCapacity = ((Number) payload.get("maxCapacity")).intValue();
        CourseOffering created = service.createCourseOffering(courseId, semesterId, maxCapacity);
        return ResponseEntity.ok(mapper.toResponse(created));
    }

    @GetMapping
    public ResponseEntity<List<CourseOfferingResponse>> getAll() {
        return ResponseEntity.ok(service.getAllCourseOfferings());
    }
}