package com.erp.it.postgres;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.application.dto.AdmissionApplicationDto;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.admission.application.service.AdmissionApplicationService;
import com.erp.admission.document.dto.DocumentUploadRequest;
import com.erp.admission.document.entity.ApplicantDocument;
import com.erp.admission.document.repository.ApplicantDocumentRepository;
import com.erp.admission.document.service.DocumentVerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@AutoConfigureMockMvc
public class AdmissionsPostgresIT extends AbstractPostgresIT {

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private ApplicantDocumentRepository documentRepository;

    @Autowired
    private AdmissionApplicationService applicationService;

    @Autowired
    private DocumentVerificationService documentService;

    private Applicant applicant;
    private Program program;
    private AcademicYear academicYear;

    @BeforeEach
    public void setup() {
        academicYear = new AcademicYear();
        academicYear.setName("AY-PG-" + UUID.randomUUID().toString().substring(0, 6));
        academicYear.setStartDate(LocalDate.of(2026, 8, 1));
        academicYear.setEndDate(LocalDate.of(2027, 5, 30));
        academicYear.setIsActive(true);
        academicYear = academicYearRepository.save(academicYear);

        program = new Program();
        program.setName("Prog-PG-" + UUID.randomUUID().toString().substring(0, 6));
        program.setDuration(4);
        program.setIsActive(true);
        program = programRepository.save(program);

        applicant = Applicant.builder()
                .firstName("Postgres")
                .lastName("Applicant")
                .email("pg.applicant." + UUID.randomUUID().toString().substring(0, 6) + "@example.com")
                .phone("9" + (long) (Math.random() * 1_000_000_000L))
                .dateOfBirth(LocalDate.of(2004, 1, 1))
                .gender("MALE")
                .address("PostgreSQL Test Lab")
                .build();
        applicant = applicantRepository.save(applicant);
    }

    @Test
    @Transactional
    @DisplayName("PostgreSQL IT: Verify admission application creation and status flow with real foreign keys")
    public void testAdmissionApplicationLifecycleInPostgres() {
        AdmissionApplicationDto draft = applicationService.createDraftApplication(
                applicant.getId(), program.getId(), academicYear.getId());

        assertThat(draft.getId()).isNotNull();
        assertThat(draft.getStatus()).isEqualTo(ApplicationStatus.DRAFT);
        assertThat(draft.getApplicantId()).isEqualTo(applicant.getId());

        AdmissionApplicationDto submitted = applicationService.submitApplication(draft.getId());
        assertThat(submitted.getStatus()).isEqualTo(ApplicationStatus.SUBMITTED);
        assertThat(submitted.getSubmittedAt()).isNotNull();

        AdmissionApplicationDto reviewed = applicationService.updateStatus(
                draft.getId(), ApplicationStatus.UNDER_REVIEW, "Documents under review");
        assertThat(reviewed.getStatus()).isEqualTo(ApplicationStatus.UNDER_REVIEW);
    }

    @Test
    @Transactional
    @DisplayName("PostgreSQL IT: Verify applicant document upload and persistence integrity")
    public void testApplicantDocumentUploadAndListingInPostgres() {
        DocumentUploadRequest request = DocumentUploadRequest.builder()
                .applicantId(applicant.getId())
                .documentType("12TH_MARKSHEET")
                .fileUrl("https://storage.edupulse.internal/docs/marksheet.pdf")
                .build();

        ApplicantDocument savedDoc = documentService.uploadDocument(request);
        assertThat(savedDoc.getId()).isNotNull();
        assertThat(savedDoc.getVerificationStatus()).isEqualTo("PENDING");
        assertThat(savedDoc.getApplicant().getId()).isEqualTo(applicant.getId());

        List<ApplicantDocument> docs = documentService.getApplicantDocuments(applicant.getId());
        assertThat(docs).hasSize(1);
        assertThat(docs.get(0).getDocumentType()).isEqualTo("12TH_MARKSHEET");

        ApplicantDocument verifiedDoc = documentService.verifyDocument(savedDoc.getId(), "VERIFIED", "Original verified");
        assertThat(verifiedDoc.getVerificationStatus()).isEqualTo("VERIFIED");
        assertThat(verifiedDoc.getVerifiedAt()).isNotNull();
    }
}
