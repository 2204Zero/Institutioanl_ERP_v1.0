-- Migration V4: Link Users to Faculty and Student Domain Entities

-- 1. Add nullable user_id to faculty table
ALTER TABLE faculty ADD COLUMN user_id BIGINT;
ALTER TABLE faculty ADD CONSTRAINT uq_faculty_user_id UNIQUE (user_id);
ALTER TABLE faculty ADD CONSTRAINT fk_faculty_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Add nullable user_id to students table
ALTER TABLE students ADD COLUMN user_id BIGINT;
ALTER TABLE students ADD CONSTRAINT uq_students_user_id UNIQUE (user_id);
ALTER TABLE students ADD CONSTRAINT fk_students_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Deterministic backfill: link accounts where role and email match unambiguously
UPDATE faculty 
SET user_id = (
    SELECT u.id 
    FROM users u 
    WHERE lower(u.email) = lower(faculty.official_email) 
      AND u.role = 'FACULTY'
)
WHERE EXISTS (
    SELECT 1 
    FROM users u 
    WHERE lower(u.email) = lower(faculty.official_email) 
      AND u.role = 'FACULTY'
);

UPDATE students 
SET user_id = (
    SELECT u.id 
    FROM users u 
    WHERE lower(u.email) = lower(students.email) 
      AND u.role = 'STUDENT'
)
WHERE EXISTS (
    SELECT 1 
    FROM users u 
    WHERE lower(u.email) = lower(students.email) 
      AND u.role = 'STUDENT'
);
