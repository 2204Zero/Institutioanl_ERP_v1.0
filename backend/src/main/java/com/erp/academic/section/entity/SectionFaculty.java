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
@Table(name = "section_faculty")
public class SectionFaculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "faculty_id", nullable = false)
    private Long facultyId;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(name = "role", nullable = false)
    private String role; // CLASS_TEACHER, SUBJECT_TEACHER, LAB_INSTRUCTOR, MENTOR

    @Column(name = "assigned_at", updatable = false)
    @Builder.Default
    private Instant assignedAt = Instant.now();
}
