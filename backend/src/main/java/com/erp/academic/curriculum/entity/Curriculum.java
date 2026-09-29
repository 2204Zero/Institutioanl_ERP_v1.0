package com.erp.academic.curriculum.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "curriculum")
public class Curriculum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String version;
    private Long programId;
    private Long semesterId;
    private Long effectiveAcademicYearId;
    private Integer totalCredits;
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
