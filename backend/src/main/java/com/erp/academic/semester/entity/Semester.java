package com.erp.academic.semester.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "semester")
public class Semester {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Integer semesterNumber;
    private Long academicYearId;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
