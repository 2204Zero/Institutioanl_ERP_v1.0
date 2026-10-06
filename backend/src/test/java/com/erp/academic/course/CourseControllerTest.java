package com.erp.academic.course;

import com.erp.academic.course.controller.CourseController;
import com.erp.academic.course.dto.CourseCreateRequest;
import com.erp.academic.course.dto.CourseResponse;
import com.erp.academic.course.service.CourseService;
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

class CourseControllerTest {

    @Mock
    private CourseService service;

    @InjectMocks
    private CourseController controller;

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
    @DisplayName("Should create course successfully")
    void testCreateCourse() throws Exception {
        CourseCreateRequest request = CourseCreateRequest.builder()
                .code("CS301")
                .name("Database Management Systems")
                .courseType("THEORY")
                .credits(4)
                .departmentId(1L)
                .programId(1L)
                .isActive(true)
                .build();

        CourseResponse response = new CourseResponse();
        response.setId(1L);
        response.setCode("CS301");
        response.setName("Database Management Systems");
        response.setCourseType("THEORY");
        response.setCredits(4);
        response.setDepartmentId(1L);
        response.setIsActive(true);

        when(service.create(any(CourseCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("CS301"))
                .andExpect(jsonPath("$.credits").value(4));
    }

    @Test
    @DisplayName("Should search and filter courses")
    void testSearchAndFilter() throws Exception {
        CourseResponse response = new CourseResponse();
        response.setId(1L);
        response.setCode("CS301");
        response.setName("Database Management Systems");

        when(service.getAll(eq("DBMS"), eq(1L), eq(null), eq("THEORY"), eq(true)))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/courses?search=DBMS&departmentId=1&courseType=THEORY&isActive=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("CS301"));
    }

    @Test
    @DisplayName("Should deactivate course")
    void testDeactivateCourse() throws Exception {
        CourseResponse response = new CourseResponse();
        response.setId(1L);
        response.setIsActive(false);

        when(service.deactivate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/courses/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Should delete course")
    void testDeleteCourse() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/courses/1"))
                .andExpect(status().isNoContent());
    }
}
