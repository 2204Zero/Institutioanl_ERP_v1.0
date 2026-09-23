package com.erp.student;

import com.erp.common.exception.GlobalExceptionHandler;
import com.erp.student.controller.StudentController;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.dto.StudentStatusUpdateDto;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class StudentControllerTest {

    @Autowired
    private StudentController studentController;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentController)
                .setControllerAdvice(globalExceptionHandler)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    private StudentRequestDto createSampleStudentRequest(String rollNumber, String email) {
        StudentRequestDto dto = new StudentRequestDto();
        dto.setRollNumber(rollNumber);
        dto.setFirstName("Rohan");
        dto.setLastName("Verma");
        dto.setEmail(email);
        dto.setPhone("+919876543210");
        dto.setDateOfBirth(LocalDate.of(2004, 5, 20));
        dto.setGender("MALE");
        dto.setBloodGroup("B+");
        dto.setAddress("45 Park Avenue");
        dto.setCity("Mumbai");
        dto.setState("Maharashtra");
        dto.setPincode("400001");
        dto.setDepartment("Computer Science and Engineering");
        dto.setProgram("B.Tech");
        dto.setBatch("2022-2026");
        dto.setEnrollmentDate(LocalDate.of(2022, 8, 1));
        dto.setStatus(StudentStatus.ACTIVE);
        return dto;
    }

    @Test
    @DisplayName("Day 02 & 06: Should create student successfully and return 201")
    void testCreateStudentSuccess() throws Exception {
        StudentRequestDto request = createSampleStudentRequest("TEST-CS-001", "rohan.test1@college.edu");

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rollNumber", is("TEST-CS-001")))
                .andExpect(jsonPath("$.data.email", is("rohan.test1@college.edu")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("Day 06: Validation error should return 400 Bad Request with field errors")
    void testCreateStudentValidationError() throws Exception {
        StudentRequestDto invalidRequest = new StudentRequestDto();
        invalidRequest.setRollNumber(""); // Blank
        invalidRequest.setEmail("invalid-email-format"); // Invalid email

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.validationErrors.rollNumber", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.email", notNullValue()));
    }

    @Test
    @DisplayName("Day 02: Should list students with pagination and search filter")
    void testListStudents() throws Exception {
        StudentRequestDto request = createSampleStudentRequest("TEST-CS-002", "rohan.test2@college.edu");
        mockMvc.perform(post("/api/v1/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        mockMvc.perform(get("/api/v1/students")
                        .param("search", "TEST-CS-002")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Day 05: Should update student status with audit logging")
    void testUpdateStudentStatus() throws Exception {
        StudentRequestDto request = createSampleStudentRequest("TEST-CS-003", "rohan.test3@college.edu");
        MvcResult result = mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        long studentId = objectMapper.readTree(responseBody).path("data").path("id").asLong();

        StudentStatusUpdateDto statusUpdate = new StudentStatusUpdateDto(
                StudentStatus.SUSPENDED,
                "Temporarily suspended due to attendance shortage",
                "principal"
        );

        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUSPENDED")));

        // Verify status history
        mockMvc.perform(get("/api/v1/students/" + studentId + "/status-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
    }
}
