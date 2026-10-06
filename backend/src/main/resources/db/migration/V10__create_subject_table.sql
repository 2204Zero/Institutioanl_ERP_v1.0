CREATE TABLE subject (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject_type VARCHAR(50) NOT NULL,
    credits INT NOT NULL,
    is_practical BOOLEAN DEFAULT FALSE,
    department_id BIGINT NOT NULL,
    course_id BIGINT,
    program_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
