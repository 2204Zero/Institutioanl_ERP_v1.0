package com.erp.faculty.controller;

import com.erp.academic.section.dto.SectionResponse;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.faculty.service.FacultyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class FacultyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FacultyService facultyService;

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void getMySections_FAC_SEC_01_success() throws Exception {
        SectionResponse section = SectionResponse.builder()
                .id(1L)
                .name("CS101-A")
                .build();
        when(facultyService.getMySections()).thenReturn(List.of(section));

        mockMvc.perform(get("/api/v1/faculty/me/sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("CS101-A"));
    }

    @Test
    void getMySections_FAC_SEC_03_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/faculty/me/sections"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void getMySections_FAC_SEC_04_emptyList() throws Exception {
        when(facultyService.getMySections()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/faculty/me/sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    void getMySections_wrongRole_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/faculty/me/sections"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void getMyTimetable_FAC_TT_01_success() throws Exception {
        TimetableSlot slot = TimetableSlot.builder()
                .id(100L)
                .sectionId(1L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .build();
        
        when(facultyService.getMyTimetable()).thenReturn(List.of(slot));

        mockMvc.perform(get("/api/v1/faculty/me/timetable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100L))
                .andExpect(jsonPath("$[0].dayOfWeek").value("MONDAY"));
    }

    @Test
    void getMyTimetable_FAC_TT_03_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/faculty/me/timetable"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void getMyTimetable_FAC_TT_04_emptyList() throws Exception {
        when(facultyService.getMyTimetable()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/faculty/me/timetable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(username = "invalid_faculty@erp.com", roles = {"FACULTY"})
    void getMySections_FAC_SEC_05_invalidFaculty() throws Exception {
        when(facultyService.getMySections()).thenThrow(new com.erp.common.exception.ResourceNotFoundException("No faculty record found"));

        mockMvc.perform(get("/api/v1/faculty/me/sections"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "invalid_faculty@erp.com", roles = {"FACULTY"})
    void getMyTimetable_FAC_TT_05_invalidFaculty() throws Exception {
        when(facultyService.getMyTimetable()).thenThrow(new com.erp.common.exception.ResourceNotFoundException("No faculty record found"));

        mockMvc.perform(get("/api/v1/faculty/me/timetable"))
                .andExpect(status().isNotFound());
    }
}
