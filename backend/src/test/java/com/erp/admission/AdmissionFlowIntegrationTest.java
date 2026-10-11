package com.erp.admission;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.admission.applicant.dto.ApplicantDto;
import com.erp.admission.applicant.service.ApplicantService;
import com.erp.admission.application.dto.AdmissionApplicationDto;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.service.AdmissionApplicationService;
import com.erp.admission.document.dto.DocumentUploadRequest;
import com.erp.admission.document.service.DocumentVerificationService;
import com.erp.admission.elegibility.service.EligibilityCheckService;
import com.erp.admission.workflow.service.AdmissionWorkflowService;
import com.erp.student.entity.Student;
import com.erp.student.service.StudentOnboardingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class AdmissionFlowIntegrationTest {

    @Autowired private ApplicantService applicantService;
    @Autowired private DocumentVerificationService documentService;
    @Autowired private AdmissionApplicationService applicationService;
    @Autowired private EligibilityCheckService eligibilityService;
    @Autowired private AdmissionWorkflowService workflowService;
    @Autowired private StudentOnboardingService onboardingService;

    @Autowired private ProgramRepository programRepository;
    @Autowired private AcademicYearRepository academicYearRepository;
    @Autowired private BatchRepository batchRepository;
    @Autowired private SemesterRepository semesterRepository;

    @Test
    @Transactional
    public void testCompleteAdmissionFlow() {
        // Setup base data
        AcademicYear year = new AcademicYear();
        year.setName("2026-2027");
        year.setStartDate(LocalDate.of(2026, 8, 1));
        year.setEndDate(LocalDate.of(2027, 5, 30));
        year.setIsActive(true);
        year = academicYearRepository.save(year);

        Program program = new Program();
        program.setName("B.Tech Computer Science");
        program.setDuration(4);
        program.setIsActive(true);
        program = programRepository.save(program);

        Batch batch = new Batch();
        batch.setName("B.Tech CS 2026 Batch");
        batch.setCode("BTECH-CS-2026");
        batch.setProgramId(program.getId());
        batch.setAdmissionYear(2026);
        batch.setAcademicYearId(year.getId());
        batch.setIsActive(true);
        batchRepository.save(batch);

        Semester semester = new Semester();
        semester.setAcademicYearId(year.getId());
        semester.setSemesterNumber(1);
        semester.setName("Fall 2026");
        semester.setStartDate(LocalDate.of(2026, 8, 1));
        semester.setEndDate(LocalDate.of(2026, 12, 15));
        semester.setIsActive(true);
        semesterRepository.save(semester);

        // 1. Create Applicant
        ApplicantDto applicantReq = ApplicantDto.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe.admission@example.com")
                .phone("1234567890")
                .dateOfBirth(LocalDate.of(2005, 5, 15))
                .gender("MALE")
                .build();
        ApplicantDto savedApplicant = applicantService.registerApplicant(applicantReq);
        assertThat(savedApplicant.getId()).isNotNull();

        // 2. Upload Document
        DocumentUploadRequest docReq = DocumentUploadRequest.builder()
                .applicantId(savedApplicant.getId())
                .documentType("12TH_MARKSHEET")
                .fileUrl("http://s3.local/marksheet.pdf")
                .build();
        var doc = documentService.uploadDocument(docReq);
        documentService.verifyDocument(doc.getId(), "VERIFIED", "Looks good");

        // 3. Create Draft Application & Submit
        AdmissionApplicationDto application = applicationService.createDraftApplication(savedApplicant.getId(), program.getId(), year.getId());
        application = applicationService.submitApplication(application.getId());
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.SUBMITTED);

        // 4. Workflow -> Under Review
        var underReview = workflowService.processWorkflowStep(application.getId(), ApplicationStatus.UNDER_REVIEW);
        assertThat(underReview.getStatus()).isEqualTo(ApplicationStatus.UNDER_REVIEW);

        // 5. Check Eligibility
        boolean isEligible = eligibilityService.checkEligibility(underReview.getId());
        assertThat(isEligible).isTrue();

        // 6. Workflow -> Admitted
        var admitted = workflowService.processWorkflowStep(application.getId(), ApplicationStatus.ADMITTED);
        assertThat(admitted.getStatus()).isEqualTo(ApplicationStatus.ADMITTED);

        // 7. Onboarding to Student
        Student student = onboardingService.onboardStudent(admitted.getId());
        assertThat(student).isNotNull();
        assertThat(student.getRollNumber()).startsWith("STU-");
        assertThat(student.getEmail()).isEqualTo("john.doe@institution.edu");
    }
}
