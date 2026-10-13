package com.erp.devjson.attendance;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.AttendanceJsonModels.AttendanceRecord;
import com.erp.devjson.model.AttendanceJsonModels.StudentAttendanceSummary;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import com.erp.devjson.timetable.JsonTimetableDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Profile("dev-json")
public class JsonAttendanceDataStoreManager {

    private final JsonEntityStore<AttendanceRecord> attendanceStore;
    private final JsonStudentDataStoreManager studentManager;
    private final JsonTimetableDataStoreManager timetableManager;

    private static final Set<String> VALID_STATUSES = Set.of("PRESENT", "ABSENT", "LATE", "EXCUSED");

    @Autowired
    public JsonAttendanceDataStoreManager(
            DevJsonProperties properties,
            JsonStudentDataStoreManager studentManager,
            JsonTimetableDataStoreManager timetableManager) {
        this(properties.getStoragePath(), studentManager, timetableManager);
    }

    public JsonAttendanceDataStoreManager(
            Path baseDirectory,
            JsonStudentDataStoreManager studentManager,
            JsonTimetableDataStoreManager timetableManager) {
        this.studentManager = studentManager;
        this.timetableManager = timetableManager;
        JsonFileStorageEngine engine = new JsonFileStorageEngine();
        this.attendanceStore = new JsonEntityStore<>(
                baseDirectory.resolve("attendance_records.json"),
                AttendanceRecord.class, engine,
                AttendanceRecord::getId, AttendanceRecord::setId);
    }

    public synchronized AttendanceRecord recordAttendance(AttendanceRecord record) {
        if (record.getStudentId() == null) {
            throw new BusinessException("Student ID cannot be null");
        }
        if (record.getScheduleId() == null) {
            throw new BusinessException("Schedule ID cannot be null");
        }
        if (record.getAttendanceDate() == null) {
            record.setAttendanceDate(LocalDate.now());
        }
        if (record.getStatus() == null || !VALID_STATUSES.contains(record.getStatus().trim().toUpperCase())) {
            throw new BusinessException("Invalid attendance status: " + record.getStatus());
        }

        record.setStatus(record.getStatus().trim().toUpperCase());

        if (studentManager != null && studentManager.getStudentById(record.getStudentId()).isEmpty()) {
            throw new ResourceNotFoundException("Student not found with id: " + record.getStudentId());
        }
        if (timetableManager != null && timetableManager.getSlotById(record.getScheduleId()).isEmpty()) {
            throw new ResourceNotFoundException("Timetable slot not found with id: " + record.getScheduleId());
        }

        // Duplicate attendance check: (studentId, scheduleId, attendanceDate)
        boolean exists = attendanceStore.findAll().stream()
                .anyMatch(r -> r.getStudentId().equals(record.getStudentId())
                        && r.getScheduleId().equals(record.getScheduleId())
                        && r.getAttendanceDate().equals(record.getAttendanceDate()));
        if (exists) {
            throw new BusinessException("Attendance already recorded for student " + record.getStudentId()
                    + " on schedule " + record.getScheduleId() + " for date " + record.getAttendanceDate());
        }

        record.setRecordedAt(LocalDateTime.now());
        return attendanceStore.save(record);
    }

    public synchronized List<AttendanceRecord> recordBulkAttendance(Long scheduleId, LocalDate date, List<AttendanceRecord> records) {
        if (scheduleId == null) {
            throw new BusinessException("Schedule ID is required");
        }
        if (date == null) {
            date = LocalDate.now();
        }
        if (records == null || records.isEmpty()) {
            throw new BusinessException("Attendance records list cannot be empty");
        }

        // Check for duplicates inside the request
        Set<Long> studentIdsInRequest = new HashSet<>();
        for (AttendanceRecord r : records) {
            if (!studentIdsInRequest.add(r.getStudentId())) {
                throw new BusinessException("Duplicate student ID in bulk request: " + r.getStudentId());
            }
        }

        List<AttendanceRecord> savedList = new ArrayList<>();
        for (AttendanceRecord r : records) {
            r.setScheduleId(scheduleId);
            r.setAttendanceDate(date);
            savedList.add(recordAttendance(r));
        }
        return savedList;
    }

    public List<AttendanceRecord> getAttendanceByStudent(Long studentId) {
        if (studentId == null) return List.of();
        return attendanceStore.findAll().stream()
                .filter(r -> studentId.equals(r.getStudentId()))
                .collect(Collectors.toList());
    }

    public List<AttendanceRecord> getAttendanceByScheduleAndDate(Long scheduleId, LocalDate date) {
        if (scheduleId == null || date == null) return List.of();
        return attendanceStore.findAll().stream()
                .filter(r -> scheduleId.equals(r.getScheduleId()) && date.equals(r.getAttendanceDate()))
                .collect(Collectors.toList());
    }

    /**
     * Equivalent to JPQL aggregation:
     * SELECT COUNT(r), SUM(CASE WHEN status IN ('PRESENT','LATE','EXCUSED') THEN 1 ELSE 0 END)
     */
    public StudentAttendanceSummary calculateStudentAttendanceSummary(Long studentId) {
        List<AttendanceRecord> studentRecords = getAttendanceByStudent(studentId);
        long total = studentRecords.size();
        if (total == 0) {
            return StudentAttendanceSummary.builder()
                    .studentId(studentId)
                    .totalSessions(0)
                    .attendedSessions(0)
                    .absentSessions(0)
                    .percentage(100.0)
                    .build();
        }

        long attended = studentRecords.stream()
                .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())
                        || "LATE".equalsIgnoreCase(r.getStatus())
                        || "EXCUSED".equalsIgnoreCase(r.getStatus()))
                .count();

        long absent = total - attended;
        double pct = Math.round(((double) attended / total) * 10000.0) / 100.0;

        return StudentAttendanceSummary.builder()
                .studentId(studentId)
                .totalSessions(total)
                .attendedSessions(attended)
                .absentSessions(absent)
                .percentage(pct)
                .build();
    }

    public List<AttendanceRecord> getAllAttendance() {
        return attendanceStore.findAll();
    }

    public long count() {
        return attendanceStore.count();
    }

    public JsonEntityStore<AttendanceRecord> getStore() {
        return attendanceStore;
    }
}
