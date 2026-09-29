package com.erp.student;

import com.erp.student.dto.StudentRequestDto;
import com.erp.student.entity.StudentStatus;
import com.erp.student.entity.DocumentType;


import com.erp.common.exception.GlobalExceptionHandler;
import com.erp.student.controller.StudentController;
import com.erp.student.controller.StudentDocumentController;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.entity.DocumentType;
import com.erp.student.entity.StudentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class StudentDocumentControllerTest {

    @Autowired
    private StudentDocumentController documentController;

    @Autowired
    private StudentController studentController;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    private MockMvc mockMvc;
    private MockMvc studentMockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentController)
                .setControllerAdvice(globalExceptionHandler)
                .build();
        studentMockMvc = MockMvcBuilders.standaloneSetup(studentController)
                .setControllerAdvice(globalExceptionHandler)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("Day 04: Should upload, list, view, download, and delete student document")
    void testDocumentLifecycle() throws Exception {
        // 1. Create a test student
        StudentRequestDto studentReq = new StudentRequestDto();
        studentReq.setRollNumber("TEST-DOC-01");
        studentReq.setFirstName("Ananya");
        studentReq.setLastName("Deshmukh");
        studentReq.setEmail("ananya.doc@college.edu");
        studentReq.setPhone("+919123456780");
        studentReq.setDateOfBirth(LocalDate.of(2004, 9, 12));
        studentReq.setGender("FEMALE");
        studentReq.setDepartment("Mechanical Engineering");
        studentReq.setBatch("2022-2026");
        studentReq.setEnrollmentDate(LocalDate.of(2022, 8, 1));
        studentReq.setStatus(StudentStatus.ACTIVE);

        MvcResult studentResult = studentMockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentReq)))
                .andExpect(status().isCreated())
                .andReturn();

        long studentId = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Upload Document (Aadhaar mock pdf)
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "aadhaar_card.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "%PDF-1.4 Mock Aadhaar Document Content for Testing".getBytes()
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/students/" + studentId + "/documents")
                        .file(mockFile)
                        .param("documentType", DocumentType.AADHAAR.name()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.documentType", is("AADHAAR")))
                .andExpect(jsonPath("$.data.originalFileName", is("aadhaar_card.pdf")))
                .andReturn();

        long documentId = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 3. List documents for the student
        mockMvc.perform(get("/api/v1/students/" + studentId + "/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 4. View Document inline
        mockMvc.perform(get("/api/v1/documents/" + documentId + "/view"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", is("inline; filename=\"aadhaar_card.pdf\"")));

        // 5. Download Document attachment
        mockMvc.perform(get("/api/v1/documents/" + documentId + "/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", is("attachment; filename=\"aadhaar_card.pdf\"")));

        // 6. Delete Document
        mockMvc.perform(delete("/api/v1/documents/" + documentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
