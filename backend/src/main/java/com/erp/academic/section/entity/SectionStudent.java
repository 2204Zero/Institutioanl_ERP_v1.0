package com.erp.academic.section.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "section_student")
public class SectionStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "assigned_at", updatable = false)
    @Builder.Default
    private Instant assignedAt = Instant.now();

    @Builder.Default
    private Boolean isActive = true;
}
