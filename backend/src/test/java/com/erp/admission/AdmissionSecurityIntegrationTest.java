package com.erp.admission;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.admission.applicant.dto.ApplicantDto;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.admission.document.dto.DocumentUploadRequest;
import com.erp.admission.document.repository.ApplicantDocumentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdmissionSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private AdmissionApplicationRepository applicationRepository;

    @Autowired
    private ApplicantDocumentRepository applicantDocumentRepository;

    private Applicant testApplicant;
    private Program testProgram;
    private AcademicYear testAcademicYear;
    private AdmissionApplication testDraftApplication;

    @BeforeEach
    public void setup() {
        testAcademicYear = new AcademicYear();
        testAcademicYear.setName("AY-" + UUID.randomUUID().toString().substring(0, 6));
        testAcademicYear.setStartDate(LocalDate.of(2026, 8, 1));
        testAcademicYear.setEndDate(LocalDate.of(2027, 5, 30));
        testAcademicYear.setIsActive(true);
        testAcademicYear = academicYearRepository.save(testAcademicYear);

        testProgram = new Program();
        testProgram.setName("Program-" + UUID.randomUUID().toString().substring(0, 6));
        testProgram.setDuration(4);
        testProgram.setIsActive(true);
        testProgram = programRepository.save(testProgram);

        testApplicant = Applicant.builder()
                .firstName("Alice")
                .lastName("Applicant")
                .email("alice." + UUID.randomUUID().toString().substring(0, 6) + "@example.com")
                .phone("9" + (long) (Math.random() * 1_000_000_000L))
                .dateOfBirth(LocalDate.of(2004, 3, 20))
                .gender("FEMALE")
                .address("123 Test St")
                .build();
        testApplicant = applicantRepository.save(testApplicant);

        testDraftApplication = AdmissionApplication.builder()
                .applicationNumber("APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .applicant(testApplicant)
                .program(testProgram)
                .academicYear(testAcademicYear)
                .status(ApplicationStatus.DRAFT)
                .build();
        testDraftApplication = applicationRepository.save(testDraftApplication);
    }

    // ==========================================
    // DEF-01: Admission Draft Authorization Tests
    // ==========================================

    @Test
    @DisplayName("DEF-01: Unauthenticated request to create draft application returns 401")
    public void unauthenticated_cannotCreateDraft_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/draft")
                        .param("applicantId", testApplicant.getId().toString())
                        .param("programId", testProgram.getId().toString())
                        .param("academicYearId", testAcademicYear.getId().toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("DEF-01: STUDENT attempting to create draft for arbitrary applicant returns 403 Forbidden")
    public void student_cannotCreateDraftForOtherApplicant_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/draft")
                        .param("applicantId", testApplicant.getId().toString())
                        .param("programId", testProgram.getId().toString())
                        .param("academicYearId", testAcademicYear.getId().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("DEF-01: STUDENT tampering with applicantId parameter cannot bypass ownership checks")
    public void student_tamperingApplicantId_doesNotBypassOwnership_returns403() throws Exception {
        // Test with non-existent applicant ID
        mockMvc.perform(post("/api/v1/admission-applications/draft")
                        .param("applicantId", "99999")
                        .param("programId", testProgram.getId().toString())
                        .param("academicYearId", testAcademicYear.getId().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("DEF-01: ADMIN can successfully create draft application in administrative workflow")
    public void admin_canCreateDraftApplication_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/draft")
                        .param("applicantId", testApplicant.getId().toString())
                        .param("programId", testProgram.getId().toString())
                        .param("academicYearId", testAcademicYear.getId().toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.applicantId").value(testApplicant.getId()));
    }

    @Test
    @WithMockUser(username = "superadmin1", roles = {"SUPER_ADMIN"})
    @DisplayName("DEF-01: SUPER_ADMIN can create draft application in administrative workflow")
    public void superAdmin_canCreateDraftApplication_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/draft")
                        .param("applicantId", testApplicant.getId().toString())
                        .param("programId", testProgram.getId().toString())
                        .param("academicYearId", testAcademicYear.getId().toString()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "faculty1", roles = {"FACULTY"})
    @DisplayName("DEF-01: FACULTY role is rejected from creating draft application")
    public void faculty_cannotCreateDraft_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/draft")
                        .param("applicantId", testApplicant.getId().toString())
                        .param("programId", testProgram.getId().toString())
                        .param("academicYearId", testAcademicYear.getId().toString()))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // Admission Application Submit Authorization Tests
    // ==========================================

    @Test
    @DisplayName("Unauthenticated request to submit application returns 401")
    public void unauthenticated_cannotSubmitApplication_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/{id}/submit", testDraftApplication.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("STUDENT attempting to submit application for other applicant returns 403 Forbidden")
    public void student_cannotSubmitApplication_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/{id}/submit", testDraftApplication.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("ADMIN can submit application in administrative workflow")
    public void admin_canSubmitApplication_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/admission-applications/{id}/submit", testDraftApplication.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    // ==========================================
    // DEF-02: Applicant Document Upload Authorization Tests
    // ==========================================

    @Test
    @DisplayName("DEF-02: Unauthenticated request to upload applicant document returns 401")
    public void unauthenticated_cannotUploadDocument_returns401() throws Exception {
        DocumentUploadRequest request = DocumentUploadRequest.builder()
                .applicantId(testApplicant.getId())
                .documentType("10TH_MARKSHEET")
                .fileUrl("http://s3.local/doc.pdf")
                .build();

        mockMvc.perform(post("/api/v1/applicant-documents/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("DEF-02: STUDENT attempting to upload document for unowned applicant returns 403 Forbidden")
    public void student_cannotUploadDocument_returns403() throws Exception {
        DocumentUploadRequest request = DocumentUploadRequest.builder()
                .applicantId(testApplicant.getId())
                .documentType("10TH_MARKSHEET")
                .fileUrl("http://s3.local/doc.pdf")
                .build();

        long countBefore = applicantDocumentRepository.count();

        mockMvc.perform(post("/api/v1/applicant-documents/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        // Verify unauthorized upload did NOT persist any document record
        long countAfter = applicantDocumentRepository.count();
        assertThat(countAfter).isEqualTo(countBefore);
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("DEF-02: STUDENT tampering with applicantId cannot bypass document upload ownership check")
    public void student_tamperingApplicantIdInDocUpload_doesNotBypassOwnership_returns403() throws Exception {
        DocumentUploadRequest request = DocumentUploadRequest.builder()
                .applicantId(88888L)
                .documentType("PASSPORT")
                .fileUrl("http://s3.local/tampered.pdf")
                .build();

        mockMvc.perform(post("/api/v1/applicant-documents/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("DEF-02: ADMIN can upload applicant document in administrative workflow")
    public void admin_canUploadDocument_returns201() throws Exception {
        DocumentUploadRequest request = DocumentUploadRequest.builder()
                .applicantId(testApplicant.getId())
                .documentType("GOVT_ID")
                .fileUrl("http://s3.local/admin-upload.pdf")
                .build();

        mockMvc.perform(post("/api/v1/applicant-documents/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.verificationStatus").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "superadmin1", roles = {"SUPER_ADMIN"})
    @DisplayName("DEF-02: SUPER_ADMIN can upload applicant document in administrative workflow")
    public void superAdmin_canUploadDocument_returns201() throws Exception {
        DocumentUploadRequest request = DocumentUploadRequest.builder()
                .applicantId(testApplicant.getId())
                .documentType("12TH_MARKSHEET")
                .fileUrl("http://s3.local/superadmin-upload.pdf")
                .build();

        mockMvc.perform(post("/api/v1/applicant-documents/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    // ==========================================
    // DEF-03: Applicant Registration Authorization Tests
    // ==========================================

    @Test
    @DisplayName("DEF-03: Unauthenticated request to register applicant returns 401")
    public void unauthenticated_cannotRegisterApplicant_returns401() throws Exception {
        ApplicantDto request = ApplicantDto.builder()
                .firstName("Bob")
                .lastName("Smith")
                .email("bob@example.com")
                .phone("9876543210")
                .dateOfBirth(LocalDate.of(2003, 1, 1))
                .build();

        mockMvc.perform(post("/api/v1/applicants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("DEF-03: Authenticated non-admin role (STUDENT) cannot register applicant (returns 403)")
    public void student_cannotRegisterApplicant_returns403() throws Exception {
        ApplicantDto request = ApplicantDto.builder()
                .firstName("Bob")
                .lastName("Smith")
                .email("bob.student@example.com")
                .phone("9876543211")
                .dateOfBirth(LocalDate.of(2003, 1, 1))
                .build();

        mockMvc.perform(post("/api/v1/applicants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "faculty1", roles = {"FACULTY"})
    @DisplayName("DEF-03: Authenticated non-admin role (FACULTY) cannot register applicant (returns 403)")
    public void faculty_cannotRegisterApplicant_returns403() throws Exception {
        ApplicantDto request = ApplicantDto.builder()
                .firstName("Charlie")
                .lastName("Brown")
                .email("charlie.faculty@example.com")
                .phone("9876543212")
                .dateOfBirth(LocalDate.of(2003, 1, 1))
                .build();

        mockMvc.perform(post("/api/v1/applicants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("DEF-03: ADMIN can register applicant in administrative provisioning workflow")
    public void admin_canRegisterApplicant_returns201() throws Exception {
        ApplicantDto request = ApplicantDto.builder()
                .firstName("David")
                .lastName("Miller")
                .email("david.admin." + UUID.randomUUID().toString().substring(0, 6) + "@example.com")
                .phone("9" + (long) (Math.random() * 1_000_000_000L))
                .dateOfBirth(LocalDate.of(2003, 1, 1))
                .gender("MALE")
                .address("456 College Ave")
                .build();

        mockMvc.perform(post("/api/v1/applicants")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.firstName").value("David"));
    }

    // ==========================================
    // Applicant Document Listing Tests
    // ==========================================

    @Test
    @DisplayName("Unauthenticated request to list applicant documents returns 401")
    public void unauthenticated_cannotListApplicantDocuments_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/applicant-documents/applicant/{id}", testApplicant.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student1", roles = {"STUDENT"})
    @DisplayName("STUDENT attempting to list documents of unowned applicant returns 403 Forbidden")
    public void student_cannotListApplicantDocuments_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/applicant-documents/applicant/{id}", testApplicant.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "faculty1", roles = {"FACULTY"})
    @DisplayName("FACULTY can list applicant documents for committee review (returns 200)")
    public void faculty_canListApplicantDocuments_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/applicant-documents/applicant/{id}", testApplicant.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("ADMIN can list applicant documents (returns 200)")
    public void admin_canListApplicantDocuments_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/applicant-documents/applicant/{id}", testApplicant.getId()))
                .andExpect(status().isOk());
    }
}
