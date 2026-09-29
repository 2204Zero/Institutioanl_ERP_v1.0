package com.erp.guardian;

import com.erp.student.dto.StudentRequestDto;
import com.erp.student.entity.StudentStatus;
import com.erp.guardian.dto.GuardianRequestDto;


import com.erp.common.exception.GlobalExceptionHandler;
import com.erp.guardian.controller.GuardianController;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.student.controller.StudentController;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.entity.StudentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class GuardianControllerTest {

    @Autowired
    private GuardianController guardianController;

    @Autowired
    private StudentController studentController;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    private MockMvc mockMvc;
    private MockMvc studentMockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(guardianController)
                .setControllerAdvice(globalExceptionHandler)
                .build();
        studentMockMvc = MockMvcBuilders.standaloneSetup(studentController)
                .setControllerAdvice(globalExceptionHandler)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("Day 03: Should create guardian and link with student")
    void testGuardianFlow() throws Exception {
        // 1. Create a student first
        StudentRequestDto studentReq = new StudentRequestDto();
        studentReq.setRollNumber("TEST-GRD-01");
        studentReq.setFirstName("Kavita");
        studentReq.setLastName("Patel");
        studentReq.setEmail("kavita.patel@college.edu");
        studentReq.setPhone("+919988776655");
        studentReq.setDateOfBirth(LocalDate.of(2005, 3, 10));
        studentReq.setGender("FEMALE");
        studentReq.setDepartment("Information Technology");
        studentReq.setBatch("2023-2027");
        studentReq.setEnrollmentDate(LocalDate.of(2023, 8, 1));
        studentReq.setStatus(StudentStatus.ACTIVE);

        MvcResult studentResult = studentMockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long studentId = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Add guardian directly linked to student
        GuardianRequestDto guardianReq = new GuardianRequestDto();
        guardianReq.setFirstName("Mahesh");
        guardianReq.setLastName("Patel");
        guardianReq.setRelation("FATHER");
        guardianReq.setPhone("+919876500000");
        guardianReq.setEmail("mahesh.patel@example.com");
        guardianReq.setOccupation("Architect");
        guardianReq.setIsEmergencyContact(true);

        mockMvc.perform(post("/api/v1/students/" + studentId + "/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(guardianReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.firstName", is("Mahesh")))
                .andExpect(jsonPath("$.data.studentId", is((int) studentId)));

        // 3. Retrieve student guardians
        mockMvc.perform(get("/api/v1/students/" + studentId + "/guardians"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 4. Retrieve via global /guardians endpoint
        mockMvc.perform(get("/guardians"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
