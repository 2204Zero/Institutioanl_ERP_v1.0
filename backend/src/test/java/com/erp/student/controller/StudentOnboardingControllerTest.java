package com.erp.student.controller;

import com.erp.student.entity.Student;
import com.erp.student.service.StudentOnboardingService;
import com.erp.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
public class StudentOnboardingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StudentOnboardingService onboardingService;

    @InjectMocks
    private StudentOnboardingController studentOnboardingController;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentOnboardingController).build();
    }

    @Test
    public void testOnboardStudent_Success() throws Exception {
        Student student = new Student();
        student.setRollNumber("STU-2024-ABC12");
        
        when(onboardingService.onboardStudent(anyLong())).thenReturn(student);

        mockMvc.perform(post("/api/v1/admission-workflows/applications/1/onboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rollNumber").value("STU-2024-ABC12"));
    }

}
