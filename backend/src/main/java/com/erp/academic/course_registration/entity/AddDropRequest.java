package com.erp.academic.course_registration.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "add_drop_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddDropRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_offering_id", nullable = false)
    private Long courseOfferingId;

    @Column(name = "request_type", nullable = false)
    private String requestType; // ADD, DROP

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    private String reason;

    @Column(name = "processed_by")
    private Long processedBy;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
