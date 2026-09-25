package com.example.demo;

import com.example.demo.attendance.dto.AttendanceRecordRequest;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.finance.dto.FeeCreationRequest;
import com.example.demo.student.dto.StudentCreateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RbacAndPermissionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String obtainAccessToken(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(username, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    @DisplayName("Should reject unauthenticated requests to protected endpoints with 401 Unauthorized")
    void shouldRejectUnauthenticatedRequestsWith401() throws Exception {
        mockMvc.perform(get("/api/v1/students/101"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Day 04 — Student: Should allow viewing student profile with STUDENT_PROFILE_READ authority")
    void shouldAllowStudentToViewProfile() throws Exception {
        String token = obtainAccessToken("student", "Student@123");

        mockMvc.perform(get("/api/v1/students/101")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.name").value("Manish Sharma"))
                .andExpect(jsonPath("$.department").value("Computer Science"));
    }

    @Test
    @DisplayName("Day 03/04 — Student: Should forbid student from managing users with 403 Forbidden")
    void shouldForbidStudentFromManagingUsers() throws Exception {
        String token = obtainAccessToken("student", "Student@123");

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.code").value("FORBIDDEN_OPERATION"));
    }

    @Test
    @DisplayName("Day 03/04 — Student: Should forbid student from taking attendance")
    void shouldForbidStudentFromTakingAttendance() throws Exception {
        String token = obtainAccessToken("student", "Student@123");
        AttendanceRecordRequest request = new AttendanceRecordRequest(101L, "CS-301", "PRESENT", "Attempting self mark");

        mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.code").value("FORBIDDEN_OPERATION"));
    }

    @Test
    @DisplayName("Day 04 — Faculty: Should allow taking attendance with ATTENDANCE_TAKE permission")
    void shouldAllowFacultyToTakeAttendance() throws Exception {
        String token = obtainAccessToken("faculty", "Faculty@123");
        AttendanceRecordRequest request = new AttendanceRecordRequest(101L, "CS-301", "PRESENT", "Regular Lecture");

        mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(101))
                .andExpect(jsonPath("$.status").value("PRESENT"))
                .andExpect(jsonPath("$.markedBy").value("faculty"));
    }

    @Test
    @DisplayName("Day 04 — Faculty: Should forbid faculty from managing fees")
    void shouldForbidFacultyFromManagingFees() throws Exception {
        String token = obtainAccessToken("faculty", "Faculty@123");
        FeeCreationRequest feeRequest = new FeeCreationRequest(101L, "Semester 6", new BigDecimal("60000.00"), LocalDate.now().plusMonths(1));

        mockMvc.perform(post("/api/v1/finance/fees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feeRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Day 04 — Admin: Should allow managing users with USER_MANAGE permission")
    void shouldAllowAdminToManageUsers() throws Exception {
        String token = obtainAccessToken("admin", "Admin@123");

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Day 06 — Admin: Should allow creating new student records")
    void shouldAllowAdminToCreateStudent() throws Exception {
        String token = obtainAccessToken("admin", "Admin@123");
        StudentCreateRequest request = new StudentCreateRequest("Rohan Verma", "rohan@erp.com", "Information Technology");

        mockMvc.perform(post("/api/v1/students")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Rohan Verma"))
                .andExpect(jsonPath("$.department").value("Information Technology"));
    }

    @Test
    @DisplayName("Day 06 — Admin: Should allow managing institution settings")
    void shouldAllowAdminToManageInstitution() throws Exception {
        String token = obtainAccessToken("admin", "Admin@123");
        Map<String, String> payload = Map.of("name", "Apex Institute - Updated Campus");

        mockMvc.perform(put("/api/v1/institutions/details")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Apex Institute - Updated Campus"));
    }

    @Test
    @DisplayName("Day 04 — Finance: Should allow managing fees with FEES_MANAGE permission")
    void shouldAllowFinanceToManageFees() throws Exception {
        String token = obtainAccessToken("finance", "Finance@123");
        FeeCreationRequest feeRequest = new FeeCreationRequest(101L, "Semester 6", new BigDecimal("70000.00"), LocalDate.now().plusMonths(2));

        mockMvc.perform(post("/api/v1/finance/fees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(feeRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(101))
                .andExpect(jsonPath("$.totalAmount").value(70000.00))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("Day 03 — Super Admin: Should have unrestricted access across all modules")
    void shouldAllowSuperAdminAccessToAllProtectedApis() throws Exception {
        String token = obtainAccessToken("superadmin", "Admin@123");

        // Super Admin can list all students
        mockMvc.perform(get("/api/v1/students")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Super Admin can list all users
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Super Admin can update institution
        mockMvc.perform(put("/api/v1/institutions/details")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Apex Global University"))))
                .andExpect(status().isOk());
    }
}
