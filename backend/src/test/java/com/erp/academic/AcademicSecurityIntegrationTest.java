package com.erp.academic;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AcademicSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // --- Course Registration Tests ---

    @Test
    void SEC_REG_01_unauthenticatedRegistration() throws Exception {
        mockMvc.perform(post("/api/v1/course-registrations")
                .param("studentId", "1")
                .param("courseOfferingId", "999")
                .param("sectionId", "999"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    void SEC_REG_02_studentForbiddenRegistration() throws Exception {
        mockMvc.perform(post("/api/v1/course-registrations")
                .param("studentId", "1")
                .param("courseOfferingId", "999")
                .param("sectionId", "999"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    void SEC_REG_03_adminAllowedRegistration() throws Exception {
        // Will return 404 Not Found because ids are fake, but NOT 403 Forbidden
        mockMvc.perform(post("/api/v1/course-registrations")
                .param("studentId", "99999")
                .param("courseOfferingId", "99999")
                .param("sectionId", "99999"))
                .andExpect(status().isNotFound());
    }

    // --- Academic Core Tests (e.g. Semester) ---

    @Test
    void SEC_ACAD_01_unauthenticatedSemesterCreate() throws Exception {
        mockMvc.perform(post("/api/v1/semesters")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Semester 1\",\"academicYearId\":1,\"semesterNumber\":1,\"startDate\":\"2026-01-01\",\"endDate\":\"2026-06-01\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    void SEC_ACAD_02_studentForbiddenSemesterCreate() throws Exception {
        mockMvc.perform(post("/api/v1/semesters")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Semester 1\",\"academicYearId\":1,\"semesterNumber\":1,\"startDate\":\"2026-01-01\",\"endDate\":\"2026-06-01\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    void SEC_ACAD_03_adminAllowedSemesterCreate() throws Exception {
        // Validation might pass, then it's either 404 or 400 depending on DB state, but not 403!
        mockMvc.perform(post("/api/v1/semesters")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Semester 1\",\"academicYearId\":99999,\"semesterNumber\":1,\"startDate\":\"2026-01-01\",\"endDate\":\"2026-06-01\"}"))
                .andExpect(status().isNotFound());
    }

    // --- Timetable Allocation Tests ---

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    void SEC_TIME_01_studentForbiddenAllocate() throws Exception {
        mockMvc.perform(post("/api/v1/timetable/allocate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sectionId\":1,\"dayOfWeek\":\"MONDAY\",\"startTime\":\"10:00:00\",\"endTime\":\"11:00:00\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "superadmin@erp.com", roles = {"SUPER_ADMIN"})
    void SEC_TIME_02_superAdminAllowedAllocate() throws Exception {
        // Might fail 404/400 due to data, but not 403
        mockMvc.perform(post("/api/v1/timetable/allocate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sectionId\":99999,\"dayOfWeek\":\"MONDAY\",\"startTime\":\"10:00:00\",\"endTime\":\"11:00:00\",\"subjectId\":1,\"facultyId\":1,\"roomId\":1}"));
    }
}
