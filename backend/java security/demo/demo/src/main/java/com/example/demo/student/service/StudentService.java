package com.example.demo.student.service;

import com.example.demo.common.exception.ResourceNotFoundException;
import com.example.demo.student.dto.StudentCreateRequest;
import com.example.demo.student.dto.StudentResponse;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class StudentService {

    private final Map<Long, StudentResponse> studentStore = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(100);

    public StudentService() {
        // Pre-populate mock student records
        studentStore.put(101L, new StudentResponse(101L, "STU-2026-001", "Manish Sharma", "student@erp.com", "Computer Science", "ACTIVE"));
        studentStore.put(102L, new StudentResponse(102L, "STU-2026-002", "Aarav Gupta", "aarav@erp.com", "Electrical Engineering", "ACTIVE"));
        studentStore.put(103L, new StudentResponse(103L, "STU-2026-003", "Priya Verma", "priya@erp.com", "Mechanical Engineering", "ACTIVE"));
    }

    public StudentResponse getStudentById(Long id) {
        StudentResponse student = studentStore.get(id);
        if (student == null) {
            throw new ResourceNotFoundException("Student", id);
        }
        return student;
    }

    public List<StudentResponse> getAllStudents() {
        return new ArrayList<>(studentStore.values());
    }

    public StudentResponse createStudent(StudentCreateRequest request) {
        long newId = idGenerator.incrementAndGet();
        String enrollment = "STU-2026-" + String.format("%03d", newId);
        StudentResponse student = new StudentResponse(newId, enrollment, request.name(), request.email(), request.department(), "ACTIVE");
        studentStore.put(newId, student);
        return student;
    }
}
