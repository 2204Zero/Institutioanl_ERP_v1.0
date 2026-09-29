package com.erp.academic.batch.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "batch")
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String code;
    private Long programId;
    private Integer admissionYear;
    private Integer graduationYear;
    private Long academicYearId;
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
