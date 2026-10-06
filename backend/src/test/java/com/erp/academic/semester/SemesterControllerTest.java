package com.erp.academic.semester;

import com.erp.academic.semester.controller.SemesterController;
import com.erp.academic.semester.dto.SemesterCreateRequest;
import com.erp.academic.semester.dto.SemesterResponse;
import com.erp.academic.semester.dto.SemesterUpdateRequest;
import com.erp.academic.semester.service.SemesterService;
import com.erp.common.exception.GlobalExceptionHandler;
import com.erp.common.exception.ValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SemesterControllerTest {

    @Mock
    private SemesterService service;

    @InjectMocks
    private SemesterController controller;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("Should create semester successfully")
    void testCreateSemester() throws Exception {
        SemesterCreateRequest request = SemesterCreateRequest.builder()
                .name("Semester 1")
                .semesterNumber(1)
                .academicYearId(1L)
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 12, 15))
                .isActive(true)
                .build();

        SemesterResponse response = new SemesterResponse();
        response.setId(1L);
        response.setName("Semester 1");
        response.setSemesterNumber(1);
        response.setAcademicYearId(1L);
        response.setStartDate(LocalDate.of(2026, 8, 1));
        response.setEndDate(LocalDate.of(2026, 12, 15));
        response.setIsActive(true);

        when(service.create(any(SemesterCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/semesters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Semester 1"))
                .andExpect(jsonPath("$.semesterNumber").value(1));
    }

    @Test
    @DisplayName("Should fail validation when required fields are missing")
    void testCreateSemesterValidationFailure() throws Exception {
        SemesterCreateRequest request = new SemesterCreateRequest(); // missing name, dates, etc.

        mockMvc.perform(post("/api/v1/semesters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Should get all semesters with optional filters")
    void testGetAllWithFilters() throws Exception {
        SemesterResponse response = new SemesterResponse();
        response.setId(1L);
        response.setName("Semester 1");
        response.setAcademicYearId(1L);
        response.setIsActive(true);

        when(service.getAll(eq(1L), eq(true))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/semesters?academicYearId=1&isActive=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Semester 1"));
    }

    @Test
    @DisplayName("Should deactivate semester successfully")
    void testDeactivateSemester() throws Exception {
        SemesterResponse response = new SemesterResponse();
        response.setId(1L);
        response.setIsActive(false);

        when(service.deactivate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/semesters/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Should activate semester successfully")
    void testActivateSemester() throws Exception {
        SemesterResponse response = new SemesterResponse();
        response.setId(1L);
        response.setIsActive(true);

        when(service.activate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/semesters/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Should delete semester successfully")
    void testDeleteSemester() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/semesters/1"))
                .andExpect(status().isNoContent());
    }
}
