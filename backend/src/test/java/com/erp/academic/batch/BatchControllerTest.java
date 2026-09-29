package com.erp.academic.batch;

import com.erp.academic.batch.controller.BatchController;
import com.erp.academic.batch.dto.BatchCreateRequest;
import com.erp.academic.batch.dto.BatchResponse;
import com.erp.academic.batch.service.BatchService;
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

class BatchControllerTest {

    @Mock
    private BatchService service;

    @InjectMocks
    private BatchController controller;

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
    @DisplayName("Should create batch successfully")
    void testCreateBatch() throws Exception {
        BatchCreateRequest request = BatchCreateRequest.builder()
                .name("2026 Batch")
                .code("BATCH-2026-AIDS")
                .programId(1L)
                .admissionYear(2026)
                .graduationYear(2030)
                .isActive(true)
                .build();

        BatchResponse response = new BatchResponse();
        response.setId(1L);
        response.setName("2026 Batch");
        response.setCode("BATCH-2026-AIDS");
        response.setProgramId(1L);
        response.setAdmissionYear(2026);
        response.setGraduationYear(2030);
        response.setIsActive(true);

        when(service.create(any(BatchCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/batches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("BATCH-2026-AIDS"))
                .andExpect(jsonPath("$.admissionYear").value(2026));
    }

    @Test
    @DisplayName("Should filter batches by program and year")
    void testFilterBatches() throws Exception {
        BatchResponse response = new BatchResponse();
        response.setId(1L);
        response.setCode("BATCH-2026-AIDS");
        response.setProgramId(1L);

        when(service.getAll(eq(null), eq(1L), eq(2026), eq(true))).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/batches?programId=1&admissionYear=2026&isActive=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("BATCH-2026-AIDS"));
    }

    @Test
    @DisplayName("Should deactivate batch")
    void testDeactivateBatch() throws Exception {
        BatchResponse response = new BatchResponse();
        response.setId(1L);
        response.setIsActive(false);

        when(service.deactivate(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/batches/1/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Should delete batch")
    void testDeleteBatch() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/batches/1"))
                .andExpect(status().isNoContent());
    }
}
