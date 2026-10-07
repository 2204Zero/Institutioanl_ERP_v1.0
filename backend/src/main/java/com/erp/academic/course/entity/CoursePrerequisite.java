package com.erp.academic.course.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_prerequisite", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "prerequisite_course_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePrerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_course_id", nullable = false)
    private Course prerequisiteCourse;
}
