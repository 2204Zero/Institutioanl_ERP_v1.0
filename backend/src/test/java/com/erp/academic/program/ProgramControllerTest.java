package com.erp.academic.program;

import com.erp.academic.program.controller.ProgramController;
import com.erp.academic.program.service.ProgramService;
import com.erp.academic.program.dto.ProgramResponse;
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

class ProgramControllerTest {

    @Mock
    private ProgramService service;

    @InjectMocks
    private ProgramController controller;

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
        when(service.getAll()).thenReturn(List.of(new ProgramResponse()));

        mockMvc.perform(get("/api/v1/programs"))
                .andExpect(status().isOk());
    }
}
