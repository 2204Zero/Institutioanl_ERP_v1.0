package com.erp.admission.document.entity;

import com.erp.admission.applicant.entity.Applicant;
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
@Table(name = "applicant_document")
public class ApplicantDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Column(name = "document_type", nullable = false)
    private String documentType; // e.g. 10TH_MARKSHEET, 12TH_MARKSHEET, GOVT_ID

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "uploaded_at", updatable = false)
    @Builder.Default
    private Instant uploadedAt = Instant.now();
    
    @Column(name = "verified_at")
    private Instant verifiedAt;
}
