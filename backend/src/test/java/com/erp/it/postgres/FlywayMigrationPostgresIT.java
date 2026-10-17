package com.erp.it.postgres;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class FlywayMigrationPostgresIT extends AbstractPostgresIT {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("A.1: Flyway migrations V1 through V7 apply cleanly and schema is at version 7")
    void testFlywayVersionIsCurrent() {
        MigrationInfo current = flyway.info().current();
        assertNotNull(current, "Current migration info should not be null");
        assertEquals("7", current.getVersion().getVersion(), "Flyway schema should be migrated to version 7");
        assertTrue(current.getState().isApplied(), "Version 7 migration must be in APPLIED state");
    }

    @Test
    @DisplayName("A.2: All essential ERP domain tables exist in PostgreSQL schema")
    void testEssentialTablesExist() {
        List<String> requiredTables = List.of(
                "users",
                "faculty",
                "students",
                "section",
                "timetable_slot",
                "student_attendance_record",
                "course",
                "semester",
                "academic_year"
        );

        for (String table : requiredTables) {
            Integer count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?",
                    Integer.class,
                    table
            );
            assertNotNull(count);
            assertTrue(count > 0, "Table '" + table + "' must exist in PostgreSQL public schema");
        }
    }

    @Test
    @DisplayName("A.3: User-to-domain foreign keys and unique constraints exist in PostgreSQL schema")
    void testIdentityConstraintsExist() {
        // 1. Verify unique constraints
        List<String> uniqueConstraints = jdbcTemplate.queryForList(
                "SELECT constraint_name FROM information_schema.table_constraints " +
                "WHERE table_schema = 'public' AND constraint_type = 'UNIQUE'",
                String.class
        );
        assertTrue(uniqueConstraints.contains("uq_faculty_user_id") || uniqueConstraints.contains("uk_faculty_user_id"),
                "Unique constraint 'uq_faculty_user_id' must exist on faculty table");
        assertTrue(uniqueConstraints.contains("uq_students_user_id") || uniqueConstraints.contains("uk_students_user_id"),
                "Unique constraint 'uq_students_user_id' must exist on students table");
        assertTrue(uniqueConstraints.contains("uq_applicant_user_id") || uniqueConstraints.contains("uk_applicant_user_id"),
                "Unique constraint 'uq_applicant_user_id' must exist on applicant table");

        // 2. Verify foreign keys
        List<String> foreignKeys = jdbcTemplate.queryForList(
                "SELECT constraint_name FROM information_schema.table_constraints " +
                "WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY'",
                String.class
        );
        assertTrue(foreignKeys.contains("fk_faculty_user"),
                "Foreign key 'fk_faculty_user' must exist referencing users(id)");
        assertTrue(foreignKeys.contains("fk_students_user"),
                "Foreign key 'fk_students_user' must exist referencing users(id)");
        assertTrue(foreignKeys.contains("fk_applicant_user"),
                "Foreign key 'fk_applicant_user' must exist referencing users(id)");
    }

    @Test
    @DisplayName("A.4: V7 schema columns exist with expected data types")
    void testV7ColumnsExist() {
        // students.enrollment_number
        String studentEnrollmentType = jdbcTemplate.queryForObject(
                "SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'enrollment_number'",
                String.class
        );
        assertEquals("character varying", studentEnrollmentType, "students.enrollment_number must be character varying");

        // applicant.user_id
        String applicantUserIdType = jdbcTemplate.queryForObject(
                "SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'applicant' AND column_name = 'user_id'",
                String.class
        );
        assertEquals("bigint", applicantUserIdType, "applicant.user_id must be bigint");
    }
}
