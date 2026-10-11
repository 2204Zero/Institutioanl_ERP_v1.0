package com.erp.it.postgres;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@Transactional
public class UserDomainConstraintsPostgresIT extends AbstractPostgresIT {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("C.1: Multiple students can simultaneously have user_id = NULL (nullable unique constraint)")
    void testMultipleNullUserIdsAllowedForStudents() {
        assertDoesNotThrow(() -> {
            jdbcTemplate.execute("INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status, user_id) " +
                    "VALUES (8001, 'ROLL8001', 'Null1', 'Stu', 'null1@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE', NULL)");
            jdbcTemplate.execute("INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status, user_id) " +
                    "VALUES (8002, 'ROLL8002', 'Null2', 'Stu', 'null2@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE', NULL)");
        });
    }

    @Test
    @DisplayName("C.2: Duplicate non-null faculty.user_id values are rejected by uq_faculty_user_id")
    void testDuplicateFacultyUserIdRejected() {
        // Insert user
        jdbcTemplate.execute("INSERT INTO users (id, username, password_hash, email, role, is_active) " +
                "VALUES (7001, 'fac_dup_test', 'hash', 'facdup@erp.com', 'FACULTY', true)");

        // Insert first faculty with user_id = 7001
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                "VALUES (8101, 'First', 'Faculty', 'first@erp.com', 7001)");

        // Insert second faculty with same user_id = 7001 -> must throw DataIntegrityViolationException
        assertThrows(DataIntegrityViolationException.class, () -> {
            jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                    "VALUES (8102, 'Second', 'Faculty', 'second@erp.com', 7001)");
        });
    }

    @Test
    @DisplayName("C.3: Duplicate non-null students.user_id values are rejected by uq_students_user_id")
    void testDuplicateStudentUserIdRejected() {
        // Insert user
        jdbcTemplate.execute("INSERT INTO users (id, username, password_hash, email, role, is_active) " +
                "VALUES (7002, 'stu_dup_test', 'hash', 'studup@erp.com', 'STUDENT', true)");

        // Insert first student with user_id = 7002
        jdbcTemplate.execute("INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status, user_id) " +
                "VALUES (8201, 'ROLL8201', 'First', 'Stu', 'first.stu@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE', 7002)");

        // Insert second student with same user_id = 7002 -> must throw DataIntegrityViolationException
        assertThrows(DataIntegrityViolationException.class, () -> {
            jdbcTemplate.execute("INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status, user_id) " +
                    "VALUES (8202, 'ROLL8202', 'Second', 'Stu', 'second.stu@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE', 7002)");
        });
    }

    @Test
    @DisplayName("C.4: Non-existent user references are rejected by foreign keys fk_faculty_user and fk_students_user")
    void testForeignKeyRejectsNonExistentUser() {
        assertThrows(DataIntegrityViolationException.class, () -> {
            jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                    "VALUES (8301, 'Invalid', 'Faculty', 'invalid@erp.com', 999999)");
        });

        assertThrows(DataIntegrityViolationException.class, () -> {
            jdbcTemplate.execute("INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, department, batch, enrollment_date, status, user_id) " +
                    "VALUES (8302, 'ROLL8302', 'Invalid', 'Stu', 'invalid.stu@college.edu', '1234567890', '2004-01-01', 'MALE', 'CSE', '2024-2028', '2024-08-01', 'ACTIVE', 999999)");
        });
    }

    @Test
    @DisplayName("C.5: Deleting a user sets user_id to NULL on faculty and students via ON DELETE SET NULL")
    void testOnDeleteSetNullBehavior() {
        // Create user
        jdbcTemplate.execute("INSERT INTO users (id, username, password_hash, email, role, is_active) " +
                "VALUES (7003, 'user_to_delete', 'hash', 'del@erp.com', 'FACULTY', true)");

        // Create faculty referencing user 7003
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email, user_id) " +
                "VALUES (8401, 'Delete', 'TestFac', 'del.fac@erp.com', 7003)");

        // Delete user 7003
        jdbcTemplate.execute("DELETE FROM users WHERE id = 7003");

        // Verify faculty still exists and user_id is now NULL
        Long userIdAfterDelete = jdbcTemplate.queryForObject(
                "SELECT user_id FROM faculty WHERE faculty_id = 8401", Long.class);
        assertNull(userIdAfterDelete, "faculty.user_id must be set to NULL after referencing user is deleted");

        Integer facultyCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM faculty WHERE faculty_id = 8401", Integer.class);
        assertEquals(1, facultyCount, "Faculty domain record must NOT be deleted when user is deleted");
    }
}
