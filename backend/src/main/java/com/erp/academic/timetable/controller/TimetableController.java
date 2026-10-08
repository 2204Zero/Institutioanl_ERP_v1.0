package com.erp.academic.timetable.controller;

import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.service.TimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAuthority('TIMETABLE_CREATE') or hasRole('ADMIN')")
    public ResponseEntity<TimetableSlot> allocateSlot(@RequestBody TimetableSlot slot) {
        return ResponseEntity.ok(timetableService.allocateSlot(slot));
    }

    @GetMapping("/section/{sectionId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'PARENT')")
    public ResponseEntity<List<TimetableSlot>> getSectionTimetable(@PathVariable Long sectionId) {
        return ResponseEntity.ok(timetableService.getSectionTimetable(sectionId));
    }
}