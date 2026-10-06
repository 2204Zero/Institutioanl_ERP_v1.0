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
@Table(name = "section")
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "current_enrollment")
    @Builder.Default
    private Integer currentEnrollment = 0;

    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
