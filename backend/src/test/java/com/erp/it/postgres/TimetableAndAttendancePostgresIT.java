package com.erp.it.postgres;

import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.attendance.dto.BulkAttendanceRequest;
import com.erp.attendance.dto.AttendanceRecordEntry;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
public class TimetableAndAttendancePostgresIT extends AbstractPostgresIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("E.1: Timetable slot allocation rejects invalid faculty domain IDs with HTTP 404")
    void testTimetableRejectsInvalidFacultyDomainId() throws Exception {
        // Prepare dummy section, course, semester, offering, room
        jdbcTemplate.execute("INSERT INTO course (id, code, name, department_id, credits, is_active) VALUES (901, 'CS901', 'Test Course', 1, 3, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO semester (id, name, is_active) VALUES (901, 'Fall 2026 Test', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO course_offering (id, course_id, semester_id, max_capacity, is_published) VALUES (901, 901, 901, 60, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO section (id, name, course_offering_id, capacity, current_enrollment, is_active) VALUES (901, 'Section 901', 901, 50, 0, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO room (id, room_number, building, capacity, is_active) VALUES (901, 'R901', 'Main Hall', 60, true) ON CONFLICT DO NOTHING");

        TimetableSlot slot = TimetableSlot.builder()
                .sectionId(901L)
                .facultyId(888888L) // Non-existent faculty domain ID
                .roomId(901L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .build();

        mockMvc.perform(post("/api/v1/timetable/allocate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(slot)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Faculty not found")));
    }

    @Test
    @WithMockUser(username = "fac_attendance@erp.com", roles = {"FACULTY"})
    @DisplayName("E.2: Duplicate attendance submissions translate to HTTP 409 Conflict without leaking raw SQL errors")
    void testDuplicateAttendanceRejection() throws Exception {
        // Setup schema data: faculty, section, timetable_slot, section_student, section_faculty
        jdbcTemplate.execute("INSERT INTO course (id, code, name, department_id, credits, is_active) VALUES (902, 'CS902', 'Test Course 2', 1, 3, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO semester (id, name, is_active) VALUES (902, 'Fall 2026 Test 2', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO course_offering (id, course_id, semester_id, max_capacity, is_published) VALUES (902, 902, 902, 60, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO section (id, name, course_offering_id, capacity, current_enrollment, is_active) VALUES (902, 'Section 902', 902, 50, 0, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO room (id, room_number, building, capacity, is_active) VALUES (902, 'R902', 'Main Hall 2', 60, true) ON CONFLICT DO NOTHING");

        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email) " +
                "VALUES (902, 'Att', 'Faculty', 'fac_attendance@erp.com') ON CONFLICT DO NOTHING");

        jdbcTemplate.execute("INSERT INTO section_faculty (id, section_id, faculty_id, subject_id, role) " +
                "VALUES (902, 902, 902, 1, 'PRIMARY') ON CONFLICT DO NOTHING");

        jdbcTemplate.execute("INSERT INTO timetable_slot (id, section_id, faculty_id, room_id, day_of_week, start_time, end_time, is_active) " +
                "VALUES (902, 902, 902, 902, 'MONDAY', '09:00:00', '10:00:00', true) ON CONFLICT DO NOTHING");

        jdbcTemplate.execute("INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status) " +
                "VALUES (902, 'ROLL902', 'Att', 'Student', 'att.student@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE') ON CONFLICT DO NOTHING");

        jdbcTemplate.execute("INSERT INTO section_student (id, section_id, student_id) VALUES (902, 902, 902) ON CONFLICT DO NOTHING");

        LocalDate testDate = LocalDate.of(2026, 10, 12); // A Monday

        BulkAttendanceRequest req = new BulkAttendanceRequest(
                902L,
                902L,
                testDate,
                List.of(new AttendanceRecordEntry(902L, "PRESENT", "Attended"))
        );

        // First submission -> 201 Created
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Second submission for same section/slot/date -> 409 Conflict (not a 500 SQL crash!)
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }
}
