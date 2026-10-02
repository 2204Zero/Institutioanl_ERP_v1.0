package com.erp.academic.subject;

import com.erp.academic.subject.controller.SubjectController;
import com.erp.academic.subject.dto.SubjectCreateRequest;
import com.erp.academic.subject.dto.SubjectResponse;
import com.erp.academic.subject.service.SubjectService;
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

class SubjectControllerTest {

    @Mock
    private SubjectService service;

    @InjectMocks
    private SubjectController controller;

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
    @DisplayName("Should create subject successfully")
    void testCreateSubject() throws Exception {
        SubjectCreateRequest request = SubjectCreateRequest.builder()
                .code("AI501-T")
                .name("Artificial Intelligence Theory")
                .subjectType("CORE")
                .credits(3)
                .isPractical(false)
                .departmentId(1L)
                .courseId(10L)
                .programId(1L)
                .isActive(true)
                .build();

        SubjectResponse response = SubjectResponse.builder()
                .id(1L)
                .code("AI501-T")
                .name("Artificial Intelligence Theory")
                .subjectType("CORE")
                .credits(3)
                .isPractical(false)
                .departmentId(1L)
                .courseId(10L)
                .programId(1L)
                .isActive(true)
                .build();

        when(service.create(any(SubjectCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/subjects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("AI501-T"))
                .andExpect(jsonPath("$.isPractical").value(false));
    }

    @Test
    @DisplayName("Should search and filter subjects")
    void testSearchAndFilter() throws Exception {
        SubjectResponse response = SubjectResponse.builder()
                .id(1L)
                .code("AI501-T")
                .name("Artificial Intelligence Theory")
                .build();

        when(service.getAll(eq("AI"), eq(1L), eq(10L), eq(1L), eq(false), eq(true)))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/subjects?search=AI&departmentId=1&courseId=10&programId=1&isPractical=false&isActive=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("AI501-T"));
    }

    @Test
    @DisplayName("Should deactivate subject")
    void testDeactivateSubject() throws Exception {
        SubjectResponse response = SubjectResponse.builder()
                .id(1L)
                .isActive(false)
                .build();

        when(service.deactivate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/subjects/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Should delete subject")
    void testDeleteSubject() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/subjects/1"))
                .andExpect(status().isNoContent());
    }
}
