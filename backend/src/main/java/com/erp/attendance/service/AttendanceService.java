package com.erp.attendance.service;

import com.erp.attendance.dto.*;
import com.erp.attendance.entity.StudentAttendanceRecord;
import com.erp.attendance.repository.StudentAttendanceRecordRepository;
import com.erp.academic.section.entity.SectionStudent;
import com.erp.academic.section.repository.SectionFacultyRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.faculty.service.FacultyIdentityService;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final StudentAttendanceRecordRepository attendanceRepository;
    private final SectionStudentRepository sectionStudentRepository;
    private final SectionFacultyRepository sectionFacultyRepository;
    private final SectionRepository sectionRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final FacultyIdentityService facultyIdentityService;
    private final StudentRepository studentRepository;
    private final com.erp.faculty.repository.FacultyRepository facultyRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public AttendanceService(
            StudentAttendanceRecordRepository attendanceRepository,
            SectionStudentRepository sectionStudentRepository,
            SectionFacultyRepository sectionFacultyRepository,
            SectionRepository sectionRepository,
            TimetableSlotRepository timetableSlotRepository,
            FacultyIdentityService facultyIdentityService,
            StudentRepository studentRepository,
            @org.springframework.beans.factory.annotation.Autowired(required = false)
            com.erp.faculty.repository.FacultyRepository facultyRepository) {
        this.attendanceRepository = attendanceRepository;
        this.sectionStudentRepository = sectionStudentRepository;
        this.sectionFacultyRepository = sectionFacultyRepository;
        this.sectionRepository = sectionRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.facultyIdentityService = facultyIdentityService;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    public AttendanceService(
            StudentAttendanceRecordRepository attendanceRepository,
            SectionStudentRepository sectionStudentRepository,
            SectionFacultyRepository sectionFacultyRepository,
            SectionRepository sectionRepository,
            TimetableSlotRepository timetableSlotRepository,
            FacultyIdentityService facultyIdentityService,
            StudentRepository studentRepository) {
        this(attendanceRepository, sectionStudentRepository, sectionFacultyRepository, sectionRepository, timetableSlotRepository, facultyIdentityService, studentRepository, null);
    }

    private boolean isValidStatus(String status) {
        if (status == null) return false;
        String s = status.trim().toUpperCase();
        return s.equals("PRESENT") || s.equals("ABSENT") || s.equals("LATE") || s.equals("EXCUSED");
    }

    private AttendanceResponse mapToAttendanceResponse(StudentAttendanceRecord r, String fallbackCourseCode, String fallbackMarkedBy) {
        String studentName = null;
        String rollNumber = null;
        if (studentRepository != null && r.getStudentId() != null) {
            Optional<Student> studentOpt = studentRepository.findById(r.getStudentId());
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                studentName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).trim();
                rollNumber = s.getRollNumber();
            }
        }

        String courseCode = fallbackCourseCode;
        String markedBy = fallbackMarkedBy;

        if (timetableSlotRepository != null && r.getScheduleId() != null) {
            try {
                Optional<TimetableSlot> slotOpt = timetableSlotRepository.findById(r.getScheduleId());
                if (slotOpt.isPresent()) {
                    TimetableSlot slot = slotOpt.get();
                    if (sectionRepository != null && slot.getSectionId() != null) {
                        try {
                            Optional<com.erp.academic.section.entity.Section> secOpt = sectionRepository.findById(slot.getSectionId());
                            if (secOpt.isPresent()) {
                                com.erp.academic.section.entity.Section sec = secOpt.get();
                                if (sec.getCourseOffering() != null && sec.getCourseOffering().getCourse() != null) {
                                    String code = sec.getCourseOffering().getCourse().getCode();
                                    String name = sec.getCourseOffering().getCourse().getName();
                                    if (code != null && name != null) {
                                        courseCode = code + " (" + name + ")";
                                    } else if (code != null) {
                                        courseCode = code;
                                    }
                                } else if (sec.getName() != null) {
                                    courseCode = sec.getName();
                                }
                            }
                        } catch (Exception ignored) {}
                    }
                    if (facultyRepository != null && (markedBy == null || markedBy.isBlank())) {
                        Long fid = r.getMarkedByFacultyId() != null ? r.getMarkedByFacultyId() : slot.getFacultyId();
                        if (fid != null) {
                            try {
                                Optional<com.erp.faculty.entity.Faculty> fOpt = facultyRepository.findById(fid);
                                if (fOpt.isPresent()) {
                                    com.erp.faculty.entity.Faculty f = fOpt.get();
                                    String fname = ((f.getFirstName() != null ? f.getFirstName() : "") + " " + (f.getLastName() != null ? f.getLastName() : "")).trim();
                                    if (!fname.isBlank()) {
                                        markedBy = fname;
                                    } else if (f.getOfficialEmail() != null) {
                                        markedBy = f.getOfficialEmail();
                                    }
                                }
                            } catch (Exception ignored) {}
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        if (courseCode == null || courseCode.isBlank()) {
            courseCode = "GENERAL";
        }
        if (markedBy == null || markedBy.isBlank()) {
            markedBy = "faculty";
        }

        return new AttendanceResponse(
                r.getId(),
                r.getStudentId(),
                studentName,
                rollNumber,
                courseCode,
                r.getAttendanceDate(),
                r.getStatus(),
                markedBy,
                r.getRemarks()
        );
    }

    @Transactional
    public SectionAttendanceResponse recordBulkAttendance(BulkAttendanceRequest request, String markedByEmail) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        if (request.sectionId() == null) {
            throw new IllegalArgumentException("Section ID is required");
        }
        if (request.scheduleId() == null) {
            throw new IllegalArgumentException("Schedule ID is required");
        }
        if (request.date() == null) {
            throw new IllegalArgumentException("Attendance date is required");
        }
        if (request.records() == null || request.records().isEmpty()) {
            throw new IllegalArgumentException("Attendance records list cannot be empty");
        }

        // 1. Authorization & Section Verification
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Long facultyId = null;
        if (isAdmin) {
            if (!sectionRepository.existsById(request.sectionId())) {
                throw new IllegalArgumentException("Section not found: " + request.sectionId());
            }
            try {
                facultyId = facultyIdentityService.getCurrentFacultyId();
            } catch (Exception ignored) {
                // Admins do not require a faculty profile
            }
        } else {
            facultyId = facultyIdentityService.getCurrentFacultyId();
            boolean ownsSection = (sectionFacultyRepository != null && sectionFacultyRepository.existsBySectionIdAndFacultyId(request.sectionId(), facultyId))
                    || sectionRepository.findActiveSectionsByFacultyId(facultyId).stream().anyMatch(s -> s.getId().equals(request.sectionId()));
            if (!ownsSection) {
                throw new AccessDeniedException("Faculty is not authorized for this section");
            }
        }

        // 2. Verify Schedule belongs to Section
        TimetableSlot slot = timetableSlotRepository.findById(request.scheduleId())
                .orElseThrow(() -> new IllegalArgumentException("Schedule ID not found"));
        if (!slot.getSectionId().equals(request.sectionId())) {
            throw new IllegalArgumentException("Schedule ID does not belong to the requested Section");
        }
        if (Boolean.FALSE.equals(slot.getIsActive())) {
            throw new IllegalArgumentException("Schedule slot is inactive");
        }

        // 3. Prevent duplicate submission
        boolean exists = attendanceRepository.existsByScheduleIdAndAttendanceDate(request.scheduleId(), request.date())
                || request.records().stream().anyMatch(r -> attendanceRepository.existsByStudentIdAndScheduleIdAndAttendanceDate(r.studentId(), request.scheduleId(), request.date()));
        if (exists) {
            throw new IllegalStateException("Attendance already recorded for this schedule and date");
        }

        // 4. Validate Student IDs and uniqueness in request
        Set<Long> uniqueStudentIds = request.records().stream()
                .map(AttendanceRecordEntry::studentId)
                .collect(Collectors.toSet());
        if (uniqueStudentIds.size() != request.records().size()) {
            throw new IllegalArgumentException("Duplicate student IDs found in request");
        }

        List<Long> enrolledStudentIds = sectionStudentRepository.findBySectionIdAndIsActiveTrue(request.sectionId())
                .stream().map(SectionStudent::getStudentId)
                .collect(Collectors.toList());

        for (Long reqStudentId : uniqueStudentIds) {
            if (!enrolledStudentIds.contains(reqStudentId)) {
                throw new IllegalArgumentException("Student " + reqStudentId + " is not active in this section");
            }
        }

        // 5. Validate status values
        for (AttendanceRecordEntry entry : request.records()) {
            if (entry.status() == null || !isValidStatus(entry.status())) {
                throw new IllegalArgumentException("Invalid attendance status: " + entry.status());
            }
        }

        // 6. Process and Save
        final Long finalFacultyId = facultyId;
        List<StudentAttendanceRecord> recordsToSave = request.records().stream().map(entry -> {
            return StudentAttendanceRecord.builder()
                    .studentId(entry.studentId())
                    .scheduleId(request.scheduleId())
                    .attendanceDate(request.date())
                    .status(entry.status().trim().toUpperCase())
                    .remarks(entry.remarks())
                    .markedByFacultyId(finalFacultyId)
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isAdmin) {
            Long facultyId = facultyIdentityService.getCurrentFacultyId();
            boolean ownsSection = (sectionFacultyRepository != null && sectionFacultyRepository.existsBySectionIdAndFacultyId(sectionId, facultyId))
                    || sectionRepository.findActiveSectionsByFacultyId(facultyId).stream().anyMatch(s -> s.getId().equals(sectionId));
            if (!ownsSection) {
                throw new AccessDeniedException("Faculty is not authorized for this section");
            }
        } else {
            if (!sectionRepository.existsById(sectionId)) {
                throw new com.erp.common.exception.ResourceNotFoundException("Section not found with id: " + sectionId);
            }
        }

        // Find schedule slots for this section to pull attendance
        List<TimetableSlot> slots = timetableSlotRepository.findBySectionIdAndIsActiveTrue(sectionId);
        List<Long> scheduleIds = slots.stream().map(TimetableSlot::getId).collect(Collectors.toList());
        
        List<StudentAttendanceRecord> records = scheduleIds.isEmpty() ? List.of()
                : attendanceRepository.findByScheduleIdsAndAttendanceDate(scheduleIds, date);
        
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

    // Single-record attendance workflow
    @Transactional
    public AttendanceResponse recordAttendance(AttendanceRecordRequest request, String markedByEmail) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        if (request.studentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (request.status() == null || !isValidStatus(request.status())) {
            throw new IllegalArgumentException("Invalid attendance status: " + request.status());
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Long facultyId = null;
        if (!isAdmin) {
            try {
                facultyId = facultyIdentityService.getCurrentFacultyId();
            } catch (Exception e) {
                if (authentication != null) {
                    try {
                        facultyId = facultyIdentityService.getFacultyIdForEmail(authentication.getName());
                    } catch (Exception ignored) {}
                }
            }
        }

        Long scheduleId = request.scheduleId();
        TimetableSlot slot = null;

        if (scheduleId != null) {
            final Long targetScheduleId = scheduleId;
            slot = timetableSlotRepository.findById(targetScheduleId)
                    .orElseThrow(() -> new IllegalArgumentException("Timetable schedule not found with id: " + targetScheduleId));
            if (slot.getIsActive() != null && !slot.getIsActive()) {
                throw new IllegalArgumentException("Timetable schedule is inactive: " + targetScheduleId);
            }
        } else {
            // Backward compatibility derivation: attempt to derive authoritative schedule if courseCode or student section is present
            if (request.courseCode() != null && !request.courseCode().isBlank() && !"GENERAL".equalsIgnoreCase(request.courseCode().trim())) {
                String cCode = request.courseCode().trim();
                List<SectionStudent> studentSections = sectionStudentRepository.findByStudentIdAndIsActiveTrue(request.studentId());
                for (SectionStudent ss : studentSections) {
                    com.erp.academic.section.entity.Section section = sectionRepository.findById(ss.getSectionId()).orElse(null);
                    if (section != null && section.getCourseOffering() != null && section.getCourseOffering().getCourse() != null) {
                        com.erp.academic.course.entity.Course course = section.getCourseOffering().getCourse();
                        if (cCode.equalsIgnoreCase(course.getCode())) {
                            List<TimetableSlot> sectionSlots = timetableSlotRepository.findBySectionIdAndIsActiveTrue(section.getId());
                            if (sectionSlots.size() == 1) {
                                slot = sectionSlots.get(0);
                                scheduleId = slot.getId();
                                break;
                            }
                        }
                    }
                }
            }
            if (slot == null || scheduleId == null) {
                throw new IllegalArgumentException("Schedule ID is required and could not be authoritatively resolved");
            }
        }

        Long sectionId = slot.getSectionId();

        // 1. Authorization: verify faculty ownership of the section
        if (!isAdmin) {
            if (facultyId == null) {
                throw new AccessDeniedException("Faculty identity could not be resolved");
            }
            boolean ownsSection = (sectionFacultyRepository != null && sectionFacultyRepository.existsBySectionIdAndFacultyId(sectionId, facultyId))
                    || sectionRepository.findActiveSectionsByFacultyId(facultyId).stream().anyMatch(s -> s.getId().equals(sectionId));
            if (!ownsSection) {
                throw new AccessDeniedException("Faculty is not authorized for section: " + sectionId);
            }
        }

        // 2. Domain Rule: student must belong to the schedule's section
        boolean isStudentInSection = sectionStudentRepository.existsBySectionIdAndStudentIdAndIsActiveTrue(sectionId, request.studentId());
        if (!isStudentInSection) {
            throw new IllegalArgumentException("Student " + request.studentId() + " is not enrolled in section " + sectionId);
        }

        // 3. Date handling: client-supplied historical or explicit date, defaulting to today
        LocalDate date = request.date() != null ? request.date() : LocalDate.now();

        // 4. Check duplicate attendance
        boolean exists = attendanceRepository.existsByStudentIdAndScheduleIdAndAttendanceDate(
                request.studentId(), scheduleId, date);
        if (exists) {
            throw new IllegalStateException("Attendance already recorded for this student and schedule on date: " + date);
        }

        String courseCode = request.courseCode() != null && !request.courseCode().isBlank() ? request.courseCode() : "GENERAL";

        StudentAttendanceRecord record = StudentAttendanceRecord.builder()
                .studentId(request.studentId())
                .scheduleId(scheduleId)
                .attendanceDate(date)
                .status(request.status().trim().toUpperCase())
                .remarks(request.remarks())
                .markedByFacultyId(facultyId)
                .build();
        record = attendanceRepository.save(record);
        return mapToAttendanceResponse(record, courseCode, markedByEmail);
    }

    public List<AttendanceResponse> getAttendanceByStudent(Long studentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isFaculty = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_FACULTY"));
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        List<StudentAttendanceRecord> records = attendanceRepository.findByStudentId(studentId);

        // Scope to assigned sections if caller is faculty (and not admin)
        if (isFaculty && !isAdmin) {
            Long facultyId = null;
            try {
                facultyId = facultyIdentityService.getCurrentFacultyId();
            } catch (Exception ignored) {}
            if (facultyId == null && authentication != null) {
                try {
                    facultyId = facultyIdentityService.getFacultyIdForEmail(authentication.getName());
                } catch (Exception ignored) {}
            }
            if (facultyId != null) {
                List<com.erp.academic.section.entity.SectionFaculty> assignments = sectionFacultyRepository.findByFacultyId(facultyId);
                Set<Long> sectionIds = assignments.stream().map(com.erp.academic.section.entity.SectionFaculty::getSectionId).collect(Collectors.toSet());
                List<TimetableSlot> slots = timetableSlotRepository.findAll().stream()
                        .filter(s -> sectionIds.contains(s.getSectionId()))
                        .collect(Collectors.toList());
                Set<Long> allowedScheduleIds = slots.stream().map(TimetableSlot::getId).collect(Collectors.toSet());
                records = records.stream()
                        .filter(r -> allowedScheduleIds.contains(r.getScheduleId()))
                        .collect(Collectors.toList());
            }
        }

        return records.stream()
                .map(r -> mapToAttendanceResponse(r, "GENERAL", null))
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(r -> mapToAttendanceResponse(r, "GENERAL", null))
                .collect(Collectors.toList());
    }
}
