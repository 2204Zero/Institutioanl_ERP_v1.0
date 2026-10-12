package com.erp.it.postgres;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

public class MigrationV4BackfillPostgresIT extends AbstractPostgresIT {

    private static final String ISOLATED_SCHEMA = "test_backfill_schema";

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setupIsolatedSchema() {
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS " + ISOLATED_SCHEMA + " CASCADE");
        jdbcTemplate.execute("CREATE SCHEMA " + ISOLATED_SCHEMA);
    }

    @AfterEach
    void tearDownIsolatedSchema() {
        jdbcTemplate.execute("DROP SCHEMA IF EXISTS " + ISOLATED_SCHEMA + " CASCADE");
    }

    @Test
    @DisplayName("B: Migration V4 backfill deterministically links matching accounts on pre-V4 legacy schema")
    void testMigrationV4BackfillOnLegacyV3Schema() {
        // Step 1: Migrate isolated schema to V3 only
        Flyway flywayV3 = Flyway.configure()
                .dataSource(dataSource)
                .schemas(ISOLATED_SCHEMA)
                .locations("classpath:db/migration")
                .target("3")
                .load();
        flywayV3.migrate();

        assertEquals("3", flywayV3.info().current().getVersion().getVersion(),
                "Isolated schema must be at V3 before applying fixtures");

        // Step 2: Insert representative legacy fixtures into the isolated V3 schema
        // Users (V2 table)
        jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".users (id, username, password, email, role, enabled) " +
                "VALUES (10, 'fac_match', 'hash', 'faculty@erp.com', 'FACULTY', true)");
        jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".users (id, username, password, email, role, enabled) " +
                "VALUES (20, 'stu_match', 'hash', 'matchingstudent@college.edu', 'STUDENT', true)");
        jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".users (id, username, password, email, role, enabled) " +
                "VALUES (30, 'orphan_student', 'hash', 'teststudent@erp.com', 'STUDENT', true)");

        // Faculty (V1/V3 table - no user_id column yet!)
        jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".faculty (faculty_id, first_name, last_name, official_email) " +
                "VALUES (501, 'Matching', 'Faculty', 'faculty@erp.com')");
        jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".faculty (faculty_id, first_name, last_name, official_email) " +
                "VALUES (502, 'Unmatched', 'Faculty', 'unlinkedfac@erp.com')");

        // Students (V1 table - no user_id column yet!)
        jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status) " +
                "VALUES (601, 'ROLL20', 'Match', 'Student', 'matchingstudent@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE')");

        for (int i = 1; i <= 9; i++) {
            jdbcTemplate.execute("INSERT INTO " + ISOLATED_SCHEMA + ".students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status) " +
                    "VALUES (" + (610 + i) + ", 'ROLL" + (610 + i) + "', 'Unlinked" + i + "', 'Student', 'student" + i + "@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE')");
        }

        // Step 3: Run migration V4 on the isolated schema
        Flyway flywayV4 = Flyway.configure()
                .dataSource(dataSource)
                .schemas(ISOLATED_SCHEMA)
                .locations("classpath:db/migration")
                .target("4")
                .load();
        flywayV4.migrate();

        assertEquals("4", flywayV4.info().current().getVersion().getVersion(),
                "Isolated schema must be upgraded to V4");

        // Step 4: Verify deterministic linking
        // 4.1 Faculty match
        Long linkedFacultyUserId = jdbcTemplate.queryForObject(
                "SELECT user_id FROM " + ISOLATED_SCHEMA + ".faculty WHERE faculty_id = 501", Long.class);
        assertEquals(10L, linkedFacultyUserId, "Faculty 501 must be deterministically linked to user 10");

        // 4.2 Faculty unmatched
        Long unlinkedFacultyUserId = jdbcTemplate.queryForObject(
                "SELECT user_id FROM " + ISOLATED_SCHEMA + ".faculty WHERE faculty_id = 502", Long.class);
        assertNull(unlinkedFacultyUserId, "Faculty 502 has no matching user account and must remain unlinked (NULL)");

        // 4.3 Student match
        Long linkedStudentUserId = jdbcTemplate.queryForObject(
                "SELECT user_id FROM " + ISOLATED_SCHEMA + ".students WHERE id = 601", Long.class);
        assertEquals(20L, linkedStudentUserId, "Student 601 must be deterministically linked to user 20");

        // 4.4 Nine unmatched students
        Integer unlinkedStudentCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + ISOLATED_SCHEMA + ".students WHERE user_id IS NULL", Integer.class);
        assertEquals(9, unlinkedStudentCount, "All 9 unmatched students must remain with user_id = NULL");

        // 4.5 Orphan user 30 remains unlinked
        Integer orphanLinkCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + ISOLATED_SCHEMA + ".students WHERE user_id = 30", Integer.class);
        assertEquals(0, orphanLinkCount, "Orphan STUDENT user 30 must not be linked to any student record");

        // 4.6 Primary keys remain preserved
        Integer facultyCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + ISOLATED_SCHEMA + ".faculty", Integer.class);
        assertEquals(2, facultyCount);
        Integer studentCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + ISOLATED_SCHEMA + ".students", Integer.class);
        assertEquals(10, studentCount);
    }
}
