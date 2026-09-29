package com.erp.academic.program;

import com.erp.academic.program.controller.ProgramController;
import com.erp.academic.program.dto.ProgramCreateRequest;
import com.erp.academic.program.dto.ProgramResponse;
import com.erp.academic.program.dto.ProgramUpdateRequest;
import com.erp.academic.program.service.ProgramService;
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

class ProgramControllerTest {

    @Mock
    private ProgramService service;

    @InjectMocks
    private ProgramController controller;

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
    @DisplayName("Should create program successfully")
    void testCreateProgram() throws Exception {
        ProgramCreateRequest request = ProgramCreateRequest.builder()
                .code("BTECH_AIDS")
                .name("B.Tech AI & Data Science")
                .degree("B.Tech")
                .duration(4)
                .departmentId(1L)
                .isActive(true)
                .build();

        ProgramResponse response = new ProgramResponse();
        response.setId(1L);
        response.setCode("BTECH_AIDS");
        response.setName("B.Tech AI & Data Science");
        response.setDegree("B.Tech");
        response.setDuration(4);
        response.setIsActive(true);

        when(service.create(any(ProgramCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/programs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("BTECH_AIDS"))
                .andExpect(jsonPath("$.degree").value("B.Tech"));
    }

    @Test
    @DisplayName("Should search and filter programs")
    void testSearchAndFilter() throws Exception {
        ProgramResponse response = new ProgramResponse();
        response.setId(1L);
        response.setCode("BTECH_CSE");
        response.setName("B.Tech Computer Science");
        response.setDegree("B.Tech");

        when(service.getAll(eq("CSE"), eq(1L), eq("B.Tech"), eq(true))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/programs?search=CSE&departmentId=1&degree=B.Tech&isActive=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("BTECH_CSE"));
    }

    @Test
    @DisplayName("Should deactivate program")
    void testDeactivateProgram() throws Exception {
        ProgramResponse response = new ProgramResponse();
        response.setId(1L);
        response.setIsActive(false);

        when(service.deactivate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/programs/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Should delete program")
    void testDeleteProgram() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/programs/1"))
                .andExpect(status().isNoContent());
    }
}
