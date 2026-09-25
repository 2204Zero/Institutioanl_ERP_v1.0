CREATE TABLE batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    program_id BIGINT,
    academic_year_id BIGINT,
    is_active BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
