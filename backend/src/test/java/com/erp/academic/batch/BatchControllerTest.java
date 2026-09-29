package com.erp.academic.batch;

import com.erp.academic.batch.controller.BatchController;
import com.erp.academic.batch.service.BatchService;
import com.erp.academic.batch.dto.BatchResponse;
import com.erp.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BatchControllerTest {

    @Mock
    private BatchService service;

    @InjectMocks
    private BatchController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testGetAll() throws Exception {
        when(service.getAll()).thenReturn(List.of(new BatchResponse()));

        mockMvc.perform(get("/api/v1/batches"))
                .andExpect(status().isOk());
    }
}
