package com.erp.academic.timetable.controller;

import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TimetableSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TimetableSlotRepository timetableSlotRepository;

    private Long sectionId = 101L;

    @BeforeEach
    void setUp() {
        timetableSlotRepository.deleteAll();

        TimetableSlot slot = TimetableSlot.builder()
                .sectionId(sectionId)
                .facultyId(1L)
                .roomId(1L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .isActive(true)
                .build();
        timetableSlotRepository.save(slot);
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN")
    @DisplayName("Finding B: SUPER_ADMIN is permitted to access section timetable")
    void testSuperAdminAccessSectionTimetable() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sectionId", is(sectionId.intValue())));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN is permitted to access section timetable")
    void testAdminAccessSectionTimetable() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    @DisplayName("FACULTY is permitted to access section timetable")
    void testFacultyAccessSectionTimetable() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    @DisplayName("STUDENT is permitted to access section timetable")
    void testStudentAccessSectionTimetable() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PARENT")
    @DisplayName("PARENT is permitted to access section timetable")
    void testParentAccessSectionTimetable() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ANONYMOUS_OR_GUEST")
    @DisplayName("Unauthorized roles are forbidden from accessing section timetable")
    void testUnauthorizedRoleForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request is rejected")
    void testUnauthenticatedRequestUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/timetable/section/{sectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
