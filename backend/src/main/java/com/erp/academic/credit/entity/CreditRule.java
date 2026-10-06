package com.erp.academic.credit.entity;

import com.erp.academic.semester.entity.Semester;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "credit_rule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(nullable = false)
    private Integer maxCreditsLimit; 

    @Column(nullable = false)
    private Integer minCreditsRequired;
}
