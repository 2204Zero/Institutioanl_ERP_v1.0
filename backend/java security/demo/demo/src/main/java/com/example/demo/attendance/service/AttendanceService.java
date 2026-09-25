package com.example.demo.attendance.service;

import com.example.demo.attendance.dto.AttendanceRecordRequest;
import com.example.demo.attendance.dto.AttendanceResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AttendanceService {

    private final List<AttendanceResponse> records = new CopyOnWriteArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(500);

    public AttendanceService() {
        // Sample initial attendance
        records.add(new AttendanceResponse(501L, 101L, "CS-301", LocalDate.now().minusDays(1), "PRESENT", "faculty", "Regular session"));
        records.add(new AttendanceResponse(502L, 102L, "CS-301", LocalDate.now().minusDays(1), "PRESENT", "faculty", "Regular session"));
        records.add(new AttendanceResponse(503L, 103L, "CS-301", LocalDate.now().minusDays(1), "ABSENT", "faculty", "Medical leave"));
    }

    public AttendanceResponse recordAttendance(AttendanceRecordRequest request, String markedBy) {
        long id = idGenerator.incrementAndGet();
        AttendanceResponse response = new AttendanceResponse(
                id,
                request.studentId(),
                request.courseCode(),
                LocalDate.now(),
                request.status().toUpperCase(),
                markedBy,
                request.remarks()
        );
        records.add(response);
        return response;
    }

    public List<AttendanceResponse> getAttendanceByStudent(Long studentId) {
        return records.stream()
                .filter(r -> r.studentId().equals(studentId))
                .toList();
    }

    public List<AttendanceResponse> getAllAttendance() {
        return new ArrayList<>(records);
    }
}
