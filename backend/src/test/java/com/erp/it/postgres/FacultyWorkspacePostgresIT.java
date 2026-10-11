package com.erp.it.postgres;

import com.erp.auth.model.Role;
import com.erp.auth.model.UserPrincipal;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.faculty.service.FacultyIdentityService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@Transactional
public class FacultyWorkspacePostgresIT extends AbstractPostgresIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private FacultyIdentityService facultyIdentityService;

    @Test
    @WithMockUser(username = "student_pg@erp.com", roles = {"STUDENT"})
    @DisplayName("F.1: Student role is forbidden from faculty sections endpoint with HTTP 403")
    void testStudentForbiddenFromFacultySections() throws Exception {
        mockMvc.perform(get("/api/v1/faculty/me/sections"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("F.2: Faculty identity resolution enforces user_id precedence, avoids unassigned records, and supports legacy fallback")
    void testFacultyIdentityResolutionPrecedenceAndFallback() {
        // Setup isolated fixtures
        jdbcTemplate.execute("INSERT INTO users (id, username, password, email, role, enabled) " +
                "VALUES (9501, 'fac_user_9501', 'hash', 'user9501@erp.com', 'FACULTY', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                "VALUES (9501, 'Explicit', 'Faculty', 'domain9501@erp.com', 9501) ON CONFLICT DO NOTHING");

        // Fixtures for precedence testing:
        // User 9502 has email 'precedence_match@erp.com'
        // Faculty 9502 has user_id = 9502, official_email = 'other_email@erp.com'
        // Faculty 9503 has user_id = NULL, official_email = 'precedence_match@erp.com'
        jdbcTemplate.execute("INSERT INTO users (id, username, password, email, role, enabled) " +
                "VALUES (9502, 'fac_user_9502', 'hash', 'precedence_match@erp.com', 'FACULTY', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                "VALUES (9502, 'Precedence', 'Faculty', 'other_email@erp.com', 9502) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                "VALUES (9503, 'EmailOnly', 'Faculty', 'precedence_match@erp.com', NULL) ON CONFLICT DO NOTHING");

        // Fixture for legacy email fallback (user_id = NULL)
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                "VALUES (9504, 'Legacy', 'Faculty', 'legacy_fallback@erp.com', NULL) ON CONFLICT DO NOTHING");

        try {
            // Case 1: Explicit faculty.user_id resolves to the correct faculty domain record
            UserPrincipal principal1 = new UserPrincipal(9501L, "fac_user_9501", "hash", "user9501@erp.com", Role.FACULTY, Role.FACULTY.getPermissions(), true);
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(principal1, null, principal1.getAuthorities())
            );
            Long resolvedId1 = facultyIdentityService.getCurrentFacultyId();
            assertEquals(9501L, resolvedId1, "Explicit user_id must resolve to the linked faculty domain ID 9501");

            // Case 2: Explicit user-ID relationship takes precedence over email matching
            UserPrincipal principal2 = new UserPrincipal(9502L, "fac_user_9502", "hash", "precedence_match@erp.com", Role.FACULTY, Role.FACULTY.getPermissions(), true);
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(principal2, null, principal2.getAuthorities())
            );
            Long resolvedId2 = facultyIdentityService.getCurrentFacultyId();
            assertEquals(9502L, resolvedId2, "Explicit user_id must resolve faculty 9502, taking precedence over email match on faculty 9503");

            // Case 3: An unrelated or unmatched faculty record is not selected
            UserPrincipal unmatchedPrincipal = new UserPrincipal(9599L, "unmatched_user", "hash", "unmatched@erp.com", Role.FACULTY, Role.FACULTY.getPermissions(), true);
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(unmatchedPrincipal, null, unmatchedPrincipal.getAuthorities())
            );
            assertThrows(ResourceNotFoundException.class, () -> facultyIdentityService.getCurrentFacultyId(),
                    "Unmatched user principal must not arbitrarily match any faculty record");

            // Case 4: Legacy email fallback behaves as intended when principal has no ID
            UserPrincipal legacyPrincipal = UserPrincipal.of("legacy_user", "hash", "legacy_fallback@erp.com", Role.FACULTY);
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(legacyPrincipal, null, legacyPrincipal.getAuthorities())
            );
            Long resolvedLegacyId = facultyIdentityService.getCurrentFacultyId();
            assertEquals(9504L, resolvedLegacyId, "Legacy principal without user_id must fall back to matching official_email");
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    @DisplayName("F.3: Attendance read endpoint enforces section ownership between assigned and unassigned faculty")
    void testAttendanceReadEndpointEnforcesFacultySectionOwnership() throws Exception {
        // Setup academic hierarchy
        jdbcTemplate.execute("INSERT INTO course (id, code, name, department_id, credits, is_active) VALUES (9601, 'CS9601', 'Ownership Course', 1, 3, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO semester (id, name, is_active) VALUES (9601, 'Fall 2026 Ownership', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO course_offering (id, course_id, semester_id, max_capacity, is_published) VALUES (9601, 9601, 9601, 60, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO section (id, name, course_offering_id, capacity, current_enrollment, is_active) VALUES (9601, 'Section 9601', 9601, 50, 0, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO section (id, name, course_offering_id, capacity, current_enrollment, is_active) VALUES (9602, 'Section 9602', 9601, 50, 0, true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO room (id, name, capacity, is_active) VALUES (9601, 'R9601', 60, true) ON CONFLICT DO NOTHING");

        // Faculty A (Assigned to Section 9601)
        jdbcTemplate.execute("INSERT INTO users (id, username, password, email, role, enabled) VALUES (9601, 'fac_assigned_9601', 'hash', 'assigned9601@erp.com', 'FACULTY', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) VALUES (9601, 'Assigned', 'Faculty', 'assigned9601@erp.com', 9601) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO section_faculty (id, section_id, faculty_id, subject_id, role) VALUES (9601, 9601, 9601, 1, 'PRIMARY') ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO timetable_slot (id, section_id, faculty_id, room_id, day_of_week, start_time, end_time, is_active) " +
                "VALUES (9601, 9601, 9601, 9601, 'MONDAY', '09:00:00', '10:00:00', true) ON CONFLICT DO NOTHING");

        // Faculty B (Unassigned to Section 9601; assigned only to Section 9602)
        jdbcTemplate.execute("INSERT INTO users (id, username, password, email, role, enabled) VALUES (9602, 'fac_unassigned_9602', 'hash', 'unassigned9602@erp.com', 'FACULTY', true) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) VALUES (9602, 'Unassigned', 'Faculty', 'unassigned9602@erp.com', 9602) ON CONFLICT DO NOTHING");
        jdbcTemplate.execute("INSERT INTO section_faculty (id, section_id, faculty_id, subject_id, role) VALUES (9602, 9602, 9602, 1, 'PRIMARY') ON CONFLICT DO NOTHING");

        LocalDate testDate = LocalDate.of(2026, 10, 12);
        UserPrincipal assignedPrincipal = new UserPrincipal(9601L, "fac_assigned_9601", "hash", "assigned9601@erp.com", Role.FACULTY, Role.FACULTY.getPermissions(), true);
        UserPrincipal unassignedPrincipal = new UserPrincipal(9602L, "fac_unassigned_9602", "hash", "unassigned9602@erp.com", Role.FACULTY, Role.FACULTY.getPermissions(), true);

        // Case 1: Assigned faculty reads section 9601 attendance -> HTTP 200 OK
        mockMvc.perform(get("/api/v1/attendance/section/9601")
                        .param("date", testDate.toString())
                        .with(user(assignedPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sectionId", is(9601)));

        // Case 2: Unassigned faculty attempts to read section 9601 attendance -> HTTP 403 Forbidden
        mockMvc.perform(get("/api/v1/attendance/section/9601")
                        .param("date", testDate.toString())
                        .with(user(unassignedPrincipal)))
                .andExpect(status().isForbidden());

        // Case 3: Assigned faculty can access their own assigned section list via /api/v1/faculty/me/sections
        mockMvc.perform(get("/api/v1/faculty/me/sections")
                        .with(user(assignedPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(9601)));
    }
}
