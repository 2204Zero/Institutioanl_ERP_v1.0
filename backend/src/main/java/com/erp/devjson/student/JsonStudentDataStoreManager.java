package com.erp.devjson.student;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.StudentJsonModels.*;
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
public class JsonStudentDataStoreManager {

    private final JsonEntityStore<StudentRecord> studentStore;
    private final JsonEntityStore<StudentStatusHistoryRecord> historyStore;

    @Autowired
    public JsonStudentDataStoreManager(DevJsonProperties properties) {
        this(properties.getStoragePath());
    }

    public JsonStudentDataStoreManager(Path baseDirectory) {
        JsonFileStorageEngine engine = new JsonFileStorageEngine();

        this.studentStore = new JsonEntityStore<>(
                baseDirectory.resolve("students.json"),
                StudentRecord.class, engine,
                StudentRecord::getId, StudentRecord::setId);

        this.historyStore = new JsonEntityStore<>(
                baseDirectory.resolve("student_status_history.json"),
                StudentStatusHistoryRecord.class, engine,
                StudentStatusHistoryRecord::getId, StudentStatusHistoryRecord::setId);
    }

    public synchronized StudentRecord createStudent(StudentRecord student) {
        if (student.getEmail() == null || student.getEmail().isBlank()) {
            throw new BusinessException("Student email is required");
        }
        if (student.getRollNumber() == null || student.getRollNumber().isBlank()) {
            throw new BusinessException("Student roll number is required");
        }

        // Email uniqueness check
        boolean emailExists = studentStore.findAll().stream()
                .anyMatch(s -> s.getEmail().equalsIgnoreCase(student.getEmail().trim()));
        if (emailExists) {
            throw new BusinessException("A student with email '" + student.getEmail() + "' already exists.");
        }

        // Roll number uniqueness check
        boolean rollExists = studentStore.findAll().stream()
                .anyMatch(s -> s.getRollNumber().equalsIgnoreCase(student.getRollNumber().trim()));
        if (rollExists) {
            throw new BusinessException("A student with roll number '" + student.getRollNumber() + "' already exists.");
        }

        student.setStatus("ACTIVE");
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());
        if (student.getEnrollmentDate() == null) {
            student.setEnrollmentDate(LocalDate.now());
        }

        StudentRecord saved = studentStore.save(student);

        // Initial enrollment history
        StudentStatusHistoryRecord history = StudentStatusHistoryRecord.builder()
                .studentId(saved.getId())
                .previousStatus(null)
                .newStatus("ACTIVE")
                .reason("Initial student enrollment")
                .changedBy("system")
                .effectiveDate(saved.getEnrollmentDate())
                .changedAt(LocalDateTime.now())
                .build();
        historyStore.save(history);

        return saved;
    }

    public Optional<StudentRecord> getStudentById(Long id) {
        return studentStore.findById(id);
    }

    public Optional<StudentRecord> getStudentByRollNumber(String rollNumber) {
        if (rollNumber == null) return Optional.empty();
        return studentStore.findAll().stream()
                .filter(s -> rollNumber.equalsIgnoreCase(s.getRollNumber()))
                .findFirst();
    }

    public List<StudentRecord> getAllStudents(String query, String status, String department) {
        return studentStore.findAll().stream()
                .filter(s -> {
                    if (status != null && !status.isBlank() && !s.getStatus().equalsIgnoreCase(status.trim())) {
                        return false;
                    }
                    if (department != null && !department.isBlank() && (s.getDepartment() == null || !s.getDepartment().equalsIgnoreCase(department.trim()))) {
                        return false;
                    }
                    if (query != null && !query.isBlank()) {
                        String q = query.trim().toLowerCase();
                        boolean matchName = (s.getFirstName() + " " + s.getLastName()).toLowerCase().contains(q);
                        boolean matchRoll = s.getRollNumber() != null && s.getRollNumber().toLowerCase().contains(q);
                        boolean matchEmail = s.getEmail() != null && s.getEmail().toLowerCase().contains(q);
                        return matchName || matchRoll || matchEmail;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(StudentRecord::getId).reversed())
                .collect(Collectors.toList());
    }

    public synchronized StudentRecord updateStudentStatus(Long studentId, String targetStatus, String reason, String changedBy, LocalDate effectiveDate) {
        StudentRecord student = studentStore.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        String currentStatus = student.getStatus();
        if (targetStatus == null || targetStatus.isBlank()) {
            throw new BusinessException("Target status cannot be null or blank");
        }

        String target = targetStatus.trim().toUpperCase();
        if (currentStatus.equalsIgnoreCase(target)) {
            // Idempotent repeated transition: return existing record without duplicate audit entry
            return student;
        }

        validateStatusTransition(currentStatus, target);

        student.setStatus(target);
        student.setUpdatedAt(LocalDateTime.now());
        StudentRecord updated = studentStore.save(student);

        // Record immutable audit history
        StudentStatusHistoryRecord history = StudentStatusHistoryRecord.builder()
                .studentId(studentId)
                .previousStatus(currentStatus)
                .newStatus(target)
                .reason(reason != null && !reason.isBlank() ? reason : "Status updated to " + target)
                .changedBy(changedBy != null && !changedBy.isBlank() ? changedBy : "admin")
                .effectiveDate(effectiveDate != null ? effectiveDate : LocalDate.now())
                .changedAt(LocalDateTime.now())
                .build();
        historyStore.save(history);

        return updated;
    }

    public List<StudentStatusHistoryRecord> getStatusHistory(Long studentId) {
        if (studentStore.findById(studentId).isEmpty()) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return historyStore.findAll().stream()
                .filter(h -> Objects.equals(h.getStudentId(), studentId))
                .sorted(Comparator.comparing(StudentStatusHistoryRecord::getChangedAt).reversed())
                .collect(Collectors.toList());
    }

    private void validateStatusTransition(String current, String target) {
        boolean isValid = switch (current) {
            case "ACTIVE" -> target.equals("GRADUATED") || target.equals("SUSPENDED")
                    || target.equals("TRANSFERRED") || target.equals("DROPPED")
                    || target.equals("INACTIVE");
            case "INACTIVE", "SUSPENDED" -> target.equals("ACTIVE") || target.equals("DROPPED")
                    || target.equals("TRANSFERRED");
            case "GRADUATED" -> target.equals("ALUMNI");
            case "ALUMNI", "DROPPED", "TRANSFERRED" -> false; // Terminal states
            default -> false;
        };

        if (!isValid) {
            throw new BusinessException("Invalid status transition from " + current + " to " + target);
        }
    }

    public long count() {
        return studentStore.count();
    }

    public JsonEntityStore<StudentRecord> getStudentStore() {
        return studentStore;
    }

    public JsonEntityStore<StudentStatusHistoryRecord> getHistoryStore() {
        return historyStore;
    }
}

