package com.erp.student.history.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "student_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "event_type", nullable = false)
    private String eventType; // STATUS_CHANGE, PROGRAM_CHANGE, DISCIPLINARY

    private String oldState;
    private String newState;
    private String reason;

    @Column(name = "recorded_by")
    private Long recordedBy;

    @Builder.Default
    private Instant recordedAt = Instant.now();
}
