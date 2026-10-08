package com.erp.attendance.service;

import com.erp.attendance.dto.*;
import com.erp.attendance.entity.StudentAttendanceRecord;
import com.erp.attendance.repository.StudentAttendanceRecordRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.faculty.service.FacultyIdentityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final StudentAttendanceRecordRepository attendanceRepository;
    private final SectionStudentRepository sectionStudentRepository;
    private final SectionRepository sectionRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final FacultyIdentityService facultyIdentityService;

    public AttendanceService(
            StudentAttendanceRecordRepository attendanceRepository,
            SectionStudentRepository sectionStudentRepository,
            SectionRepository sectionRepository,
            TimetableSlotRepository timetableSlotRepository,
            FacultyIdentityService facultyIdentityService) {
        this.attendanceRepository = attendanceRepository;
        this.sectionStudentRepository = sectionStudentRepository;
        this.sectionRepository = sectionRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.facultyIdentityService = facultyIdentityService;
    }

    @Transactional
    public SectionAttendanceResponse recordBulkAttendance(BulkAttendanceRequest request, String markedByEmail) {
        Long facultyId = facultyIdentityService.getCurrentFacultyId();

        // 1. Verify Faculty owns Section
        boolean ownsSection = sectionRepository.findActiveSectionsByFacultyId(facultyId)
                .stream().anyMatch(s -> s.getId().equals(request.sectionId()));
        if (!ownsSection) {
            throw new org.springframework.security.access.AccessDeniedException("Faculty is not authorized for this section");
        }

        // 2. Verify Schedule belongs to Section
        TimetableSlot slot = timetableSlotRepository.findById(request.scheduleId())
                .orElseThrow(() -> new IllegalArgumentException("Schedule ID not found"));
        if (!slot.getSectionId().equals(request.sectionId())) {
            throw new IllegalArgumentException("Schedule ID does not belong to the requested Section");
        }

        // 3. Prevent duplicate submission
        boolean exists = attendanceRepository.existsByStudentIdAndScheduleIdAndAttendanceDate(
                request.records().get(0).studentId(), request.scheduleId(), request.date());
        if (exists) {
            throw new IllegalStateException("Attendance already recorded for this schedule and date"); // Will map to 409 if handled, or 400
        }

        // 4. Validate Student IDs and uniqueness in request
        Set<Long> uniqueStudentIds = request.records().stream()
                .map(AttendanceRecordEntry::studentId)
                .collect(Collectors.toSet());
        if (uniqueStudentIds.size() != request.records().size()) {
            throw new IllegalArgumentException("Duplicate student IDs found in request");
        }

        List<Long> enrolledStudentIds = sectionStudentRepository.findBySectionIdAndIsActiveTrue(request.sectionId())
                .stream().map(com.erp.academic.section.entity.SectionStudent::getStudentId)
                .collect(Collectors.toList());

        for (Long reqStudentId : uniqueStudentIds) {
            if (!enrolledStudentIds.contains(reqStudentId)) {
                throw new IllegalArgumentException("Student " + reqStudentId + " is not active in this section");
            }
        }

        // 5. Process and Save
        List<StudentAttendanceRecord> recordsToSave = request.records().stream().map(entry -> {
            return StudentAttendanceRecord.builder()
                    .studentId(entry.studentId())
                    .scheduleId(request.scheduleId())
                    .attendanceDate(request.date())
                    .status(entry.status())
                    .remarks(entry.remarks())
                    .markedByFacultyId(facultyId)
                    .build();
        }).collect(Collectors.toList());

        List<StudentAttendanceRecord> savedRecords = attendanceRepository.saveAll(recordsToSave);

        return SectionAttendanceResponse.builder()
                .sectionId(request.sectionId())
                .scheduleId(request.scheduleId())
                .date(request.date())
                .records(savedRecords.stream().map(this::mapToStudentResponse).collect(Collectors.toList()))
                .build();
    }

    public SectionAttendanceResponse getAttendanceBySectionAndDate(Long sectionId, LocalDate date, String userEmail) {
        Long facultyId = facultyIdentityService.getCurrentFacultyId();

        // 1. Verify Faculty owns Section
        boolean ownsSection = sectionRepository.findActiveSectionsByFacultyId(facultyId)
                .stream().anyMatch(s -> s.getId().equals(sectionId));
        if (!ownsSection) {
            throw new org.springframework.security.access.AccessDeniedException("Faculty is not authorized for this section");
        }

        // Find schedule slots for this section to pull attendance
        List<TimetableSlot> slots = timetableSlotRepository.findBySectionIdAndIsActiveTrue(sectionId);
        List<Long> scheduleIds = slots.stream().map(TimetableSlot::getId).collect(Collectors.toList());
        
        List<StudentAttendanceRecord> records = attendanceRepository.findByScheduleIdsAndAttendanceDate(scheduleIds, date);
        
        return SectionAttendanceResponse.builder()
                .sectionId(sectionId)
                .date(date)
                .records(records.stream().map(this::mapToStudentResponse).collect(Collectors.toList()))
                .build();
    }

    private StudentAttendanceResponse mapToStudentResponse(StudentAttendanceRecord record) {
        return StudentAttendanceResponse.builder()
                .id(record.getId())
                .studentId(record.getStudentId())
                .status(record.getStatus())
                .remarks(record.getRemarks())
                .markedByFacultyId(record.getMarkedByFacultyId())
                .recordedAt(record.getCreatedAt())
                .build();
    }

    // Preservation of existing single-record logic to prevent breaking older UI/Tests
    @Transactional
    public AttendanceResponse recordAttendance(AttendanceRecordRequest request, String markedByEmail) {
        Long facultyId = null;
        try { facultyId = facultyIdentityService.getCurrentFacultyId(); } catch(Exception e) {}
        
        StudentAttendanceRecord record = StudentAttendanceRecord.builder()
                .studentId(request.studentId())
                .scheduleId(1L) // Dummy or default for backward compatibility
                .attendanceDate(LocalDate.now())
                .status(request.status().toUpperCase())
                .remarks(request.remarks())
                .markedByFacultyId(facultyId)
                .build();
        record = attendanceRepository.save(record);
        return new AttendanceResponse(record.getId(), record.getStudentId(), request.courseCode(), record.getAttendanceDate(), record.getStatus(), markedByEmail, record.getRemarks());
    }

    public List<AttendanceResponse> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(r -> new AttendanceResponse(r.getId(), r.getStudentId(), "UNKNOWN", r.getAttendanceDate(), r.getStatus(), "faculty", r.getRemarks()))
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(r -> new AttendanceResponse(r.getId(), r.getStudentId(), "UNKNOWN", r.getAttendanceDate(), r.getStatus(), "faculty", r.getRemarks()))
                .collect(Collectors.toList());
    }
}

