package com.erp.attendance.policy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "attendance_alert")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_offering_id", nullable = false)
    private Long courseOfferingId;

    @Column(name = "alert_type", nullable = false)
    private String alertType; // LOW_ATTENDANCE_WARNING, SUSPENSION_WARNING

    private String message;

    @Column(nullable = false)
    private String status; // UNREAD, READ, RESOLVED

    @Builder.Default
    private Instant createdAt = Instant.now();
}
