package com.erp.attendance.recording.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "attendance_record", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"class_session_id", "student_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_session_id", nullable = false)
    private Long classSessionId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String status; // PRESENT, ABSENT, LATE, EXCUSED

    private String remarks;

    @Column(name = "recorded_by")
    private Long recordedBy;

    @Builder.Default
    private Instant recordedAt = Instant.now();
}
