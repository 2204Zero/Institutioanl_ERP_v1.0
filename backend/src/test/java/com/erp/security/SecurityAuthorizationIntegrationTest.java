package com.erp.security;

import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.StudentDocument;
import com.erp.student.entity.DocumentType;
import com.erp.student.repository.StudentDocumentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SecurityAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private StudentDocumentRepository documentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private org.springframework.core.env.Environment env;

    private Student student1;
    private Student student2;
    private Guardian guardianOfStudent1;
    private StudentDocument docOfStudent1;

    @BeforeEach
    void setUp() {
        String dbUrl = env.getProperty("spring.datasource.url");
        if (dbUrl != null && (dbUrl.contains("edupulse_erp") || dbUrl.contains("one"))) {
            throw new IllegalStateException("Test is connected to a protected database: " + dbUrl);
        }

        jdbcTemplate.execute("DELETE FROM student_documents");
        jdbcTemplate.execute("DELETE FROM guardians");
        jdbcTemplate.execute("DELETE FROM students WHERE email IN ('student1@college.edu', 'student2@college.edu')");

        student1 = new Student("STU-SEC-01", "Alice", "Security", "student1@college.edu", "9876543201",
                LocalDate.of(2003, 1, 1), "FEMALE", "Computer Science", "2023-2027", LocalDate.of(2023, 8, 1));
        student1.setStatus(StudentStatus.ACTIVE);
        student1 = studentRepository.save(student1);

        student2 = new Student("STU-SEC-02", "Bob", "Security", "student2@college.edu", "9876543202",
                LocalDate.of(2003, 2, 2), "MALE", "Information Technology", "2023-2027", LocalDate.of(2023, 8, 1));
        student2.setStatus(StudentStatus.ACTIVE);
        student2 = studentRepository.save(student2);

        guardianOfStudent1 = new Guardian("David", "Security", "FATHER", "9876543203", "parent1@college.edu");
        guardianOfStudent1.setStudent(student1);
        guardianOfStudent1 = guardianRepository.save(guardianOfStudent1);

        docOfStudent1 = new StudentDocument(student1, DocumentType.AADHAAR, "stored_aadhaar.pdf",
                "aadhaar.pdf", "application/pdf", 1024L, "dummy/path/aadhaar.pdf");
        docOfStudent1 = documentRepository.save(docOfStudent1);
    }

    // ==========================================
    // 1. Student IDOR / Ownership Protection
    // ==========================================

    @Test
    @DisplayName("SEC-01: Student accessing their own profile succeeds (HTTP 200)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentAccessOwnProfile() throws Exception {
        mockMvc.perform(get("/api/v1/students/" + student1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rollNumber", is("STU-SEC-01")));
    }

    @Test
    @DisplayName("SEC-02: Student attempting to access another student's profile is forbidden (HTTP 403)")
    @WithMockUser(username = "student2@college.edu", roles = {"STUDENT"})
    void testStudentCannotAccessOtherStudentProfile() throws Exception {
        mockMvc.perform(get("/api/v1/students/" + student1.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-03: Student accessing their own profile by roll number succeeds (HTTP 200)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentAccessOwnRollNumber() throws Exception {
        mockMvc.perform(get("/api/v1/students/roll/STU-SEC-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName", is("Alice")));
    }

    @Test
    @DisplayName("SEC-04: Student attempting IDOR access to another student's roll number is forbidden (HTTP 403)")
    @WithMockUser(username = "student2@college.edu", roles = {"STUDENT"})
    void testStudentCannotAccessOtherStudentRollNumber() throws Exception {
        mockMvc.perform(get("/api/v1/students/roll/STU-SEC-01"))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 2. Student Document IDOR Protection
    // ==========================================

    @Test
    @DisplayName("SEC-05: Student viewing their own document metadata succeeds (HTTP 200)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentAccessOwnDocumentMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/documents/" + docOfStudent1.getId() + "/metadata"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.originalFileName", is("aadhaar.pdf")));
    }

    @Test
    @DisplayName("SEC-06: Student attempting IDOR access to another student's document metadata is forbidden (HTTP 403)")
    @WithMockUser(username = "student2@college.edu", roles = {"STUDENT"})
    void testStudentCannotAccessOtherStudentDocumentMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/documents/" + docOfStudent1.getId() + "/metadata"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-07: Student attempting IDOR deletion of another student's document is forbidden (HTTP 403)")
    @WithMockUser(username = "student2@college.edu", roles = {"STUDENT"})
    void testStudentCannotDeleteOtherStudentDocument() throws Exception {
        mockMvc.perform(delete("/api/v1/documents/" + docOfStudent1.getId()))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 3. Guardian IDOR Protection
    // ==========================================

    @Test
    @DisplayName("SEC-08: Student attempting to list all system guardians is forbidden (HTTP 403)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentCannotListAllGuardians() throws Exception {
        mockMvc.perform(get("/api/v1/guardians"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-09: Parent can view guardians linked to their own student (HTTP 200)")
    @WithMockUser(username = "parent1@college.edu", roles = {"PARENT"})
    void testParentCanViewLinkedStudentGuardians() throws Exception {
        mockMvc.perform(get("/api/v1/students/" + student1.getId() + "/guardians"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].firstName", is("David")));
    }

    @Test
    @DisplayName("SEC-10: Parent attempting to view unlinked student's guardians is forbidden (HTTP 403)")
    @WithMockUser(username = "parent1@college.edu", roles = {"PARENT"})
    void testParentCannotViewUnlinkedStudentGuardians() throws Exception {
        mockMvc.perform(get("/api/v1/students/" + student2.getId() + "/guardians"))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 4. Unauthorized Mutations Protection
    // ==========================================

    @Test
    @DisplayName("SEC-11: Student attempting to delete student record is forbidden (HTTP 403)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentCannotDeleteStudentRecord() throws Exception {
        mockMvc.perform(delete("/api/v1/students/" + student1.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-12: Student attempting to create institution is forbidden (HTTP 403)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentCannotCreateInstitution() throws Exception {
        mockMvc.perform(post("/api/v1/institutions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Hacked Inst", "code", "HACK"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-13: Faculty attempting to update department is forbidden (HTTP 403)")
    @WithMockUser(username = "faculty@college.edu", roles = {"FACULTY"})
    void testFacultyCannotUpdateDepartment() throws Exception {
        mockMvc.perform(put("/api/v1/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "New Dept", "code", "ND"))))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 5. SUPER_ADMIN & Finance Permissions
    // ==========================================

    @Test
    @DisplayName("SEC-14: SUPER_ADMIN can list system users (HTTP 200)")
    @WithMockUser(username = "superadmin", roles = {"SUPER_ADMIN"})
    void testSuperAdminCanListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SEC-15: SUPER_ADMIN can view finance summary reports (HTTP 200)")
    @WithMockUser(username = "superadmin", roles = {"SUPER_ADMIN"})
    void testSuperAdminCanViewFinanceSummary() throws Exception {
        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SEC-16: FINANCE role can view finance summary reports (HTTP 200)")
    @WithMockUser(username = "finance_officer", roles = {"FINANCE"})
    void testFinanceCanViewFinanceSummary() throws Exception {
        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SEC-17: STUDENT attempting to view finance summary reports is forbidden (HTTP 403)")
    @WithMockUser(username = "student1@college.edu", roles = {"STUDENT"})
    void testStudentCannotViewFinanceSummary() throws Exception {
        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(status().isForbidden());
    }
}
