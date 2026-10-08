package com.erp.attendance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "student_attendance_record", uniqueConstraints = {
    @UniqueConstraint(name = "uq_student_schedule_attendance", columnNames = {"student_id", "schedule_id", "attendance_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "marked_by_faculty_id")
    private Long markedByFacultyId;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
