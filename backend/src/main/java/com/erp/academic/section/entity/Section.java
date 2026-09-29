package com.erp.academic.section.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "section")
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private Long batchId;
    private Long semesterId;
    private Integer capacity;
    private Boolean isActive;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
