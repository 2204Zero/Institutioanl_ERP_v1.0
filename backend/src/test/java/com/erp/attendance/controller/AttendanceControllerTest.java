package com.erp.attendance.controller;

import com.erp.attendance.dto.*;
import com.erp.attendance.entity.StudentAttendanceRecord;
import com.erp.attendance.repository.StudentAttendanceRecordRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.entity.SectionStudent;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.faculty.service.FacultyIdentityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AttendanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentAttendanceRecordRepository attendanceRepo;

    @Autowired
    private SectionRepository sectionRepo;

    @Autowired
    private SectionStudentRepository sectionStudentRepo;

    @Autowired
    private com.erp.academic.section.repository.SectionFacultyRepository sectionFacultyRepo;

    @Autowired
    private TimetableSlotRepository timetableSlotRepo;

    @MockBean
    private FacultyIdentityService facultyIdentityService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private com.erp.academic.course_offering.repository.CourseOfferingRepository courseOfferingRepo;

    private Long validFacultyId = 100L;
    private Long otherFacultyId = 200L;
    private Section mySection;
    private TimetableSlot mySlot;

    @BeforeEach
    void setup() {
        when(facultyIdentityService.getCurrentFacultyId()).thenReturn(validFacultyId);

        // Delete existing data to prevent duplicate key errors since H2 DB_CLOSE_DELAY=-1
        jdbcTemplate.execute("DELETE FROM section_faculty");
        jdbcTemplate.execute("DELETE FROM section_student");
        jdbcTemplate.execute("DELETE FROM section");
        jdbcTemplate.execute("DELETE FROM course_offering");
        jdbcTemplate.execute("DELETE FROM course");

        // Insert dummy course, semester and offering
        jdbcTemplate.execute("INSERT INTO course (id, code, name, department_id, credits, is_active) VALUES (1, 'CS101', 'Intro', 1, 3, true)");
        jdbcTemplate.execute("INSERT INTO semester (id, name, is_active) VALUES (1, 'Fall 2026', true)");
        jdbcTemplate.execute("INSERT INTO course_offering (id, course_id, semester_id, max_capacity, is_published) VALUES (10, 1, 1, 60, true)");

        // Insert section
        mySection = Section.builder()
                .name("CS101-A")
                .courseOffering(courseOfferingRepo.findById(10L).orElse(null))
                .capacity(60)
                .currentEnrollment(10)
                .isActive(true)
                .build();
        mySection = sectionRepo.save(mySection);

        sectionFacultyRepo.save(com.erp.academic.section.entity.SectionFaculty.builder()
                .sectionId(mySection.getId())
                .facultyId(validFacultyId)
                .subjectId(5L)
                .role("PRIMARY")
                .build());

        mySlot = TimetableSlot.builder()
                .sectionId(mySection.getId())
                .facultyId(validFacultyId)
                .roomId(30L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .isActive(true)
                .build();
        mySlot = timetableSlotRepo.save(mySlot);

        // Enroll students
        sectionStudentRepo.save(SectionStudent.builder()
                .sectionId(mySection.getId())
                .studentId(1L)
                .isActive(true)
                .build());
        sectionStudentRepo.save(SectionStudent.builder()
                .sectionId(mySection.getId())
                .studentId(2L)
                .isActive(true)
                .build());
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void recordBulkAttendance_ATT_PERSIST_01_and_ATT_BULK_01_success() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                mySection.getId(),
                mySlot.getId(),
                LocalDate.now(),
                List.of(
                        new AttendanceRecordEntry(1L, "PRESENT", null),
                        new AttendanceRecordEntry(2L, "ABSENT", "Sick")
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sectionId").value(mySection.getId()))
                .andExpect(jsonPath("$.records.length()").value(2))
                .andExpect(jsonPath("$.records[0].studentId").value(1L))
                .andExpect(jsonPath("$.records[1].status").value("ABSENT"));

        // Verify DB Persistence (ATT-PERSIST-01)
        List<StudentAttendanceRecord> saved = attendanceRepo.findAll();
        assertEquals(2, saved.size());
        assertEquals("PRESENT", saved.get(0).getStatus());
        assertNotNull(saved.get(0).getId());
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void recordBulkAttendance_ATT_BULK_02_invalidStudent() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                mySection.getId(),
                mySlot.getId(),
                LocalDate.now(),
                List.of(
                        new AttendanceRecordEntry(1L, "PRESENT", null),
                        new AttendanceRecordEntry(999L, "ABSENT", null) // Not enrolled
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        // Verify transaction rolled back (ATT-TX-01)
        assertTrue(attendanceRepo.findAll().isEmpty());
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void recordBulkAttendance_ATT_SEC_02_otherFacultySection() throws Exception {
        when(facultyIdentityService.getCurrentFacultyId()).thenReturn(otherFacultyId); // Mock as someone else

        BulkAttendanceRequest request = new BulkAttendanceRequest(
                mySection.getId(),
                mySlot.getId(),
                LocalDate.now(),
                List.of(new AttendanceRecordEntry(1L, "PRESENT", null))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden()); // AccessDeniedException mapped to 403 by spring security
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void getSectionAttendance_ATT_READ_01_success() throws Exception {
        attendanceRepo.save(StudentAttendanceRecord.builder()
                .studentId(1L)
                .scheduleId(mySlot.getId())
                .attendanceDate(LocalDate.now())
                .status("LATE")
                .markedByFacultyId(validFacultyId)
                .build());

        mockMvc.perform(get("/api/v1/attendance/section/" + mySection.getId() + "?date=" + LocalDate.now()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.records.length()").value(1))
                .andExpect(jsonPath("$.records[0].studentId").value(1L))
                .andExpect(jsonPath("$.records[0].status").value("LATE"));
    }

    @Test
    @WithMockUser(username = "faculty@erp.com", roles = {"FACULTY"})
    void getSectionAttendance_ATT_READ_02_otherFacultySection() throws Exception {
        when(facultyIdentityService.getCurrentFacultyId()).thenReturn(otherFacultyId);

        mockMvc.perform(get("/api/v1/attendance/section/" + mySection.getId() + "?date=" + LocalDate.now()))
                .andExpect(status().isForbidden());
    }
}
