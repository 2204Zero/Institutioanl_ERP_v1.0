package com.erp.academic.course_offering.entity;

import com.erp.academic.course.entity.Course;
import com.erp.academic.semester.entity.Semester;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_offering", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "semester_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(nullable = false)
    private Integer maxCapacity;

    @Column(nullable = false)
    private Boolean isPublished;
}
