-- Migration V7: Add missing schema columns for Student and Applicant entities

-- 1. Add enrollment_number to students table
ALTER TABLE students ADD COLUMN enrollment_number VARCHAR(50);

-- 2. Add nullable user_id to applicant table with unique constraint and foreign key
ALTER TABLE applicant ADD COLUMN user_id BIGINT;
ALTER TABLE applicant ADD CONSTRAINT uq_applicant_user_id UNIQUE (user_id);
ALTER TABLE applicant ADD CONSTRAINT fk_applicant_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
