package com.erp.academic.section;

import com.erp.academic.section.controller.SectionController;
import com.erp.academic.section.dto.*;
import com.erp.academic.section.service.SectionService;
import com.erp.common.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SectionControllerTest {

    @Mock
    private SectionService service;

    @InjectMocks
    private SectionController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Should create section successfully")
    void testCreateSection() throws Exception {
        SectionCreateRequest request = SectionCreateRequest.builder()
                .name("Section A")
                .batchId(1L)
                .semesterId(1L)
                .capacity(60)
                .isActive(true)
                .build();

        SectionResponse response = SectionResponse.builder()
                .id(1L)
                .name("Section A")
                .batchId(1L)
                .semesterId(1L)
                .capacity(60)
                .currentEnrollment(0)
                .isActive(true)
                .build();

        when(service.create(any(SectionCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Section A"))
                .andExpect(jsonPath("$.capacity").value(60));
    }

    @Test
    @DisplayName("Should assign students to section")
    void testAssignStudentsToSection() throws Exception {
        SectionStudentAssignRequest request = SectionStudentAssignRequest.builder()
                .studentIds(List.of(101L, 102L))
                .build();

        SectionStudentResponse s1 = SectionStudentResponse.builder()
                .id(1L)
                .sectionId(1L)
                .studentId(101L)
                .rollNumber("ENR-2026-001")
                .studentName("John Doe")
                .isActive(true)
                .build();

        when(service.assignStudents(eq(1L), any(SectionStudentAssignRequest.class))).thenReturn(List.of(s1));

        mockMvc.perform(post("/api/v1/sections/1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].rollNumber").value("ENR-2026-001"));
    }

    @Test
    @DisplayName("Should assign faculty to section")
    void testAssignFacultyToSection() throws Exception {
        SectionFacultyAssignRequest request = SectionFacultyAssignRequest.builder()
                .facultyId(50L)
                .subjectId(10L)
                .role("CLASS_TEACHER")
                .build();

        SectionFacultyResponse response = SectionFacultyResponse.builder()
                .id(1L)
                .sectionId(1L)
                .facultyId(50L)
                .subjectId(10L)
                .subjectName("Database Management Systems")
                .role("CLASS_TEACHER")
                .build();

        when(service.assignFaculty(eq(1L), any(SectionFacultyAssignRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/sections/1/faculty")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CLASS_TEACHER"))
                .andExpect(jsonPath("$.facultyId").value(50));
    }

    @Test
    @DisplayName("Should remove student from section")
    void testRemoveStudentFromSection() throws Exception {
        doNothing().when(service).removeStudent(1L, 101L);

        mockMvc.perform(delete("/api/v1/sections/1/students/101"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should delete section")
    void testDeleteSection() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/sections/1"))
                .andExpect(status().isNoContent());
    }
}
