package com.erp.academic.curriculum;

import com.erp.academic.curriculum.controller.CurriculumController;
import com.erp.academic.curriculum.dto.*;
import com.erp.academic.curriculum.service.CurriculumService;
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

class CurriculumControllerTest {

    @Mock
    private CurriculumService service;

    @InjectMocks
    private CurriculumController controller;

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
    @DisplayName("Should create curriculum successfully")
    void testCreateCurriculum() throws Exception {
        CurriculumCreateRequest request = CurriculumCreateRequest.builder()
                .version("2026.1")
                .programId(1L)
                .semesterId(1L)
                .effectiveAcademicYearId(1L)
                .totalCredits(0)
                .isActive(true)
                .build();

        CurriculumResponse response = CurriculumResponse.builder()
                .id(1L)
                .version("2026.1")
                .programId(1L)
                .semesterId(1L)
                .effectiveAcademicYearId(1L)
                .totalCredits(0)
                .isActive(true)
                .build();

        when(service.create(any(CurriculumCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/curriculums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value("2026.1"));
    }

    @Test
    @DisplayName("Should assign course to curriculum with classification and credits")
    void testAssignCourseToCurriculum() throws Exception {
        CurriculumCourseAssignRequest request = CurriculumCourseAssignRequest.builder()
                .courseId(10L)
                .classification("MANDATORY")
                .credits(4)
                .build();

        CurriculumCourseResponse response = CurriculumCourseResponse.builder()
                .id(1L)
                .curriculumId(1L)
                .courseId(10L)
                .courseCode("CS301")
                .courseName("Database Management Systems")
                .classification("MANDATORY")
                .credits(4)
                .build();

        when(service.assignCourse(eq(1L), any(CurriculumCourseAssignRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/curriculums/1/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseCode").value("CS301"))
                .andExpect(jsonPath("$.classification").value("MANDATORY"))
                .andExpect(jsonPath("$.credits").value(4));
    }

    @Test
    @DisplayName("Should list assigned courses in curriculum")
    void testGetCoursesInCurriculum() throws Exception {
        CurriculumCourseResponse response = CurriculumCourseResponse.builder()
                .id(1L)
                .curriculumId(1L)
                .courseId(10L)
                .courseCode("CS301")
                .classification("MANDATORY")
                .credits(4)
                .build();

        when(service.getCourses(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/curriculums/1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseCode").value("CS301"));
    }

    @Test
    @DisplayName("Should remove course from curriculum")
    void testRemoveCourseFromCurriculum() throws Exception {
        doNothing().when(service).removeCourse(1L, 10L);

        mockMvc.perform(delete("/api/v1/curriculums/1/courses/10"))
                .andExpect(status().isNoContent());
    }
}
