BEGIN;

-- 1. Faculty
INSERT INTO faculty (faculty_id, first_name, last_name, official_email, is_active, created_at, updated_at)
VALUES (9999, 'Test', 'Faculty', 'faculty@erp.com', true, current_timestamp, current_timestamp);

-- 2. Course
INSERT INTO course (id, code, name, course_type, credits, is_active, created_at, updated_at)
VALUES (9999, 'CS101', 'Test Course', 'CORE', 3, true, current_timestamp, current_timestamp);

-- 3. Semester
INSERT INTO semester (id, name, semester_number, start_date, end_date, is_active, created_at, updated_at)
VALUES (9999, 'Fall 2026', 1, '2026-09-01', '2026-12-31', true, current_timestamp, current_timestamp);

-- 4. Course Offering
INSERT INTO course_offering (id, course_id, semester_id, max_capacity, is_published)
VALUES (9999, 9999, 9999, 50, true);

-- 5. Section
INSERT INTO section (id, course_offering_id, name, capacity, current_enrollment, is_active, created_at, updated_at)
VALUES (9999, 9999, 'A', 50, 1, true, current_timestamp, current_timestamp);

-- 6. Section Faculty
INSERT INTO section_faculty (id, section_id, faculty_id, role, assigned_at)
VALUES (9999, 9999, 9999, 'PRIMARY', current_timestamp);

-- 7. Section Student (using existing student id 4)
INSERT INTO section_student (id, section_id, student_id, is_active, assigned_at)
VALUES (9999, 9999, 4, true, current_timestamp);

-- 8. Room
INSERT INTO room (id, name, capacity, is_active)
VALUES (9999, 'Room 101', 50, true);

-- 9. Timetable Slot
INSERT INTO timetable_slot (id, section_id, faculty_id, room_id, day_of_week, start_time, end_time, is_active)
VALUES (9999, 9999, 9999, 9999, 'MONDAY', '10:00:00', '11:00:00', true);

COMMIT;
