CREATE TABLE curriculum (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(100) NOT NULL,
    program_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    effective_academic_year_id BIGINT NOT NULL,
    total_credits INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE curriculum_course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    curriculum_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    course_code VARCHAR(100),
    course_name VARCHAR(255),
    classification VARCHAR(50) NOT NULL,
    credits INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
