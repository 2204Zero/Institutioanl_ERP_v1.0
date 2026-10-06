package com.erp.academic.curriculum.entity;

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
@Table(name = "curriculum_course")
public class CurriculumCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "curriculum_id", nullable = false)
    private Long curriculumId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "course_code")
    private String courseCode;

    @Column(name = "course_name")
    private String courseName;

    @Column(name = "classification", nullable = false)
    private String classification; // MANDATORY, ELECTIVE, OPEN_ELECTIVE

    @Column(name = "credits", nullable = false)
    private Integer credits;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
