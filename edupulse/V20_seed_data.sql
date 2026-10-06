BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V20_seed_data.sql
-- Description  : 500+ Production-Grade Realistic Seed Data Records
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- 1. Academic Calendar (3 statements)
INSERT INTO academic_calendar (academic_year, term_name, start_date, end_date, is_current_term, description)
VALUES ('2025-2026', 'Fall 2025 Semester', '2025-08-01', '2025-12-20', FALSE, 'Odd Semester Academic Calendar');
INSERT INTO academic_calendar (academic_year, term_name, start_date, end_date, is_current_term, description)
VALUES ('2025-2026', 'Spring 2026 Semester', '2026-01-05', '2026-05-25', TRUE, 'Even Semester Academic Calendar');
INSERT INTO academic_calendar (academic_year, term_name, start_date, end_date, is_current_term, description)
VALUES ('2025-2026', 'Summer 2026 Term', '2026-06-01', '2026-07-25', FALSE, 'Special Remedial Term');

-- 2. Credit Policy (2 statements)
INSERT INTO credit_policy (policy_code, policy_name, min_credits_per_term, max_credits_per_term, lecture_hours_per_credit, lab_hours_per_credit, pass_grade_point)
VALUES ('UGC-CBCS-2025', 'Choice Based Credit System Undergraduate Policy', 16.00, 26.00, 15.00, 30.00, 2.00);
INSERT INTO credit_policy (policy_code, policy_name, min_credits_per_term, max_credits_per_term, lecture_hours_per_credit, lab_hours_per_credit, pass_grade_point)
VALUES ('AICTE-PG-2025', 'Postgraduate Standard Credit Policy', 12.00, 20.00, 15.00, 30.00, 2.50);

-- 3. Departments (10 statements)
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('CSE', 'Department of Computer Science & Engineering', 'Dr. Rajesh Sharma', 'cse@edupulse.edu', '+91 9811223344', 'Turing Academic Complex', 2005);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('ECE', 'Department of Electronics & Communication', 'Dr. Sunita Verma', 'ece@edupulse.edu', '+91 9811223345', 'Bhabha Tech Tower', 2005);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('ME', 'Department of Mechanical Engineering', 'Dr. Anil Kapoor', 'me@edupulse.edu', '+91 9811223346', 'Visvesvaraya Workshop', 2006);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('CE', 'Department of Civil Engineering', 'Dr. Ramesh Nair', 'ce@edupulse.edu', '+91 9811223347', 'Kalam Infrastructure Block', 2007);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('EE', 'Department of Electrical Engineering', 'Dr. Manisha Sen', 'ee@edupulse.edu', '+91 9811223348', 'Tesla Energy Labs', 2008);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('MGMT', 'School of Business Management', 'Dr. Vikramaditya Rathore', 'mgmt@edupulse.edu', '+91 9811223349', 'Chanakya Executive Center', 2010);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('MATH', 'Department of Mathematics', 'Dr. Ananya Ray', 'math@edupulse.edu', '+91 9811223350', 'Ramanujan Science Hall', 2005);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('PHYS', 'Department of Physics', 'Dr. Sanjay Kaul', 'physics@edupulse.edu', '+91 9811223351', 'CV Raman Complex', 2005);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('CHEM', 'Department of Chemistry', 'Dr. Preeti Mishra', 'chemistry@edupulse.edu', '+91 9811223352', 'Mendeleev Research Wing', 2005);
INSERT INTO department (department_code, department_name, head_of_department, contact_email, contact_phone, building_location, established_year)
VALUES ('BIO', 'Department of Biotechnology', 'Dr. Arvind Swaminathan', 'biotech@edupulse.edu', '+91 9811223353', 'Watson Discovery Lab', 2012);

-- 4. Academic Programs (8 statements)
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (1, 'BTECH-CSE', 'Bachelor of Technology in Computer Science & Engineering', 'UNDERGRADUATE', 4, 8, 160.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (1, 'MTECH-CSE', 'Master of Technology in Artificial Intelligence & Data Science', 'POSTGRADUATE', 2, 4, 72.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (2, 'BTECH-ECE', 'Bachelor of Technology in Electronics & Communication', 'UNDERGRADUATE', 4, 8, 160.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (3, 'BTECH-ME', 'Bachelor of Technology in Mechanical Engineering', 'UNDERGRADUATE', 4, 8, 160.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (4, 'BTECH-CE', 'Bachelor of Technology in Civil Engineering', 'UNDERGRADUATE', 4, 8, 160.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (5, 'BTECH-EE', 'Bachelor of Technology in Electrical Engineering', 'UNDERGRADUATE', 4, 8, 160.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (6, 'MBA-EXEC', 'Master of Business Administration', 'POSTGRADUATE', 2, 4, 80.00);
INSERT INTO academic_program (department_id, program_code, program_name, degree_level, duration_years, total_semesters, required_credits)
VALUES (10, 'BTECH-BIO', 'Bachelor of Technology in Biotechnology', 'UNDERGRADUATE', 4, 8, 160.00);

-- 5. Batches (8 statements)
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (1, 'BTECH-CSE-2022', 'B.Tech CSE Class of 2026', 2022, 2026, 8);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (1, 'BTECH-CSE-2023', 'B.Tech CSE Class of 2027', 2023, 2027, 6);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (1, 'BTECH-CSE-2024', 'B.Tech CSE Class of 2028', 2024, 2028, 4);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (1, 'BTECH-CSE-2025', 'B.Tech CSE Class of 2029', 2025, 2029, 2);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (3, 'BTECH-ECE-2024', 'B.Tech ECE Class of 2028', 2024, 2028, 4);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (4, 'BTECH-ME-2024', 'B.Tech ME Class of 2028', 2024, 2028, 4);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (7, 'MBA-2024', 'MBA Class of 2026', 2024, 2026, 4);
INSERT INTO batch (program_id, batch_code, batch_name, admission_year, graduation_year, current_semester_number)
VALUES (7, 'MBA-2025', 'MBA Class of 2027', 2025, 2027, 2);

-- 6. Semesters (4 statements)
INSERT INTO semester (calendar_id, semester_code, semester_name, semester_type, start_date, end_date)
VALUES (1, 'SEM-2025-ODD', 'Fall 2025 Regular Semester', 'ODD', '2025-08-01', '2025-12-20');
INSERT INTO semester (calendar_id, semester_code, semester_name, semester_type, start_date, end_date)
VALUES (2, 'SEM-2026-EVEN', 'Spring 2026 Regular Semester', 'EVEN', '2026-01-05', '2026-05-25');
INSERT INTO semester (calendar_id, semester_code, semester_name, semester_type, start_date, end_date)
VALUES (3, 'SEM-2026-SUMMER', 'Summer 2026 Intensive Term', 'SUMMER', '2026-06-01', '2026-07-25');
INSERT INTO semester (calendar_id, semester_code, semester_name, semester_type, start_date, end_date)
VALUES (2, 'SEM-2026-SPL', 'Spring 2026 Special Examination Term', 'SPECIAL', '2026-02-01', '2026-03-01');

-- 7. Course Categories (5 statements)
INSERT INTO course_category (category_code, category_name, is_elective, min_required_credits)
VALUES ('PC', 'Program Core', FALSE, 60.00);
INSERT INTO course_category (category_code, category_name, is_elective, min_required_credits)
VALUES ('PE', 'Program Elective', TRUE, 18.00);
INSERT INTO course_category (category_code, category_name, is_elective, min_required_credits)
VALUES ('OE', 'Open University Elective', TRUE, 12.00);
INSERT INTO course_category (category_code, category_name, is_elective, min_required_credits)
VALUES ('BS', 'Basic Sciences', FALSE, 24.00);
INSERT INTO course_category (category_code, category_name, is_elective, min_required_credits)
VALUES ('HS', 'Humanities and Social Sciences', FALSE, 12.00);

-- 8. Courses (20 statements)
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 1, 'CS101', 'Introduction to Programming in C', 4.00, 3.00, 0.00, 2.00, 'Fundamental computer programming concepts and syntax');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 1, 'CS201', 'Data Structures and Algorithms', 4.00, 3.00, 1.00, 2.00, 'Stacks, queues, trees, graphs, sorting, and dynamic programming');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 1, 'CS301', 'Relational Database Management Systems', 4.00, 3.00, 0.00, 2.00, 'PostgreSQL, query planning, indexing, and ACID compliance');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 1, 'CS302', 'Operating Systems and Systems Architecture', 4.00, 3.00, 0.00, 2.00, 'Process concurrency, virtual memory, paging, and kernel dispatch');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 1, 'CS303', 'Computer Networks and Protocols', 3.00, 3.00, 0.00, 0.00, 'OSI model, TCP/IP, routing algorithms, and network security');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 2, 'CS401', 'Artificial Intelligence and Machine Learning', 3.00, 3.00, 0.00, 0.00, 'Supervised learning, deep neural networks, and heuristics');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 2, 'CS402', 'Cloud Computing and Distributed Systems', 3.00, 3.00, 0.00, 0.00, 'Microservices, Docker, Kubernetes, and AWS architectures');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (2, 1, 'EC201', 'Analog and Digital Electronic Circuits', 4.00, 3.00, 0.00, 2.00, 'Semiconductors, operational amplifiers, and boolean circuits');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (2, 1, 'EC301', 'Microprocessors and Embedded Microcontrollers', 4.00, 3.00, 0.00, 2.00, 'ARM Cortex, assembly language, and real-time interfacing');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (3, 1, 'ME201', 'Engineering Thermodynamics', 3.00, 3.00, 1.00, 0.00, 'Laws of thermodynamics, Carnot cycle, and refrigeration');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (3, 1, 'ME301', 'Fluid Mechanics and Hydraulic Machinery', 4.00, 3.00, 0.00, 2.00, 'Bernoulli theorem, boundary layer theory, and turbines');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (4, 1, 'CE201', 'Mechanics of Structural Solids', 4.00, 3.00, 1.00, 0.00, 'Stress, strain, bending moments, and deflection of beams');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (5, 1, 'EE201', 'Electrical Circuit Analysis and Network Theory', 4.00, 3.00, 1.00, 0.00, 'Kirchhoff laws, Laplace transforms, and three-phase power');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (6, 1, 'MG101', 'Principles of Modern Management', 3.00, 3.00, 0.00, 0.00, 'Organizational behavior, strategy, and leadership models');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (6, 1, 'MG201', 'Financial Accounting and Corporate Reporting', 3.00, 3.00, 0.00, 0.00, 'Balance sheets, P&L statements, and cash flow analysis');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (7, 4, 'MA101', 'Calculus and Linear Algebra', 4.00, 3.00, 1.00, 0.00, 'Matrices, eigenvalues, multivariable calculus, and series');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (7, 4, 'MA201', 'Probability and Statistics for Engineers', 4.00, 3.00, 1.00, 0.00, 'Random variables, distributions, hypothesis testing, ANOVA');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (8, 4, 'PH101', 'Engineering Physics and Quantum Principles', 4.00, 3.00, 0.00, 2.00, 'Wave optics, lasers, fiber optics, and semiconductor physics');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (9, 4, 'CH101', 'Applied Engineering Chemistry', 4.00, 3.00, 0.00, 2.00, 'Spectroscopy, polymers, corrosion, and green chemistry');
INSERT INTO course (department_id, category_id, course_code, course_title, credits, lecture_hours, tutorial_hours, practical_hours, description)
VALUES (1, 3, 'HS101', 'Professional Technical Communication', 2.00, 2.00, 0.00, 0.00, 'Business writing, technical presentations, and communication ethics');

-- 9. Course Prerequisites (4 statements)
INSERT INTO course_prerequisite (course_id, prerequisite_course_id, minimum_grade_required, is_mandatory)
VALUES (2, 1, 'C', TRUE);
INSERT INTO course_prerequisite (course_id, prerequisite_course_id, minimum_grade_required, is_mandatory)
VALUES (3, 2, 'C', TRUE);
INSERT INTO course_prerequisite (course_id, prerequisite_course_id, minimum_grade_required, is_mandatory)
VALUES (4, 2, 'C', TRUE);
INSERT INTO course_prerequisite (course_id, prerequisite_course_id, minimum_grade_required, is_mandatory)
VALUES (6, 2, 'B', TRUE);

-- 10. Curricula & Credit Mapping (10 statements)
INSERT INTO curriculum (program_id, curriculum_version, effective_from_year, total_credits_required, approved_by_senate_date)
VALUES (1, 'CURR-CSE-2024-V1', 2024, 160.00, '2024-05-15');
INSERT INTO curriculum (program_id, curriculum_version, effective_from_year, total_credits_required, approved_by_senate_date)
VALUES (3, 'CURR-ECE-2024-V1', 2024, 160.00, '2024-05-15');

INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 1, 1, TRUE, 4.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 16, 1, TRUE, 4.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 18, 1, TRUE, 4.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 20, 1, TRUE, 2.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 2, 2, TRUE, 4.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 17, 2, TRUE, 4.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 3, 3, TRUE, 4.00);
INSERT INTO credit_mapping (curriculum_id, course_id, semester_number, is_compulsory, credit_weight)
VALUES (1, 4, 3, TRUE, 4.00);

-- 11. Course Offerings & Sections (16 statements)
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (1, 2, 'OFFER-CS101-SP26', 120, 110, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (2, 2, 'OFFER-CS201-SP26', 120, 115, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (3, 2, 'OFFER-CS301-SP26', 120, 108, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (4, 2, 'OFFER-CS302-SP26', 120, 105, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (5, 2, 'OFFER-CS303-SP26', 120, 102, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (6, 2, 'OFFER-CS401-SP26', 60, 58, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (16, 2, 'OFFER-MA101-SP26', 180, 175, 'OPEN');
INSERT INTO course_offering (course_id, semester_id, offering_code, max_enrollment_capacity, current_enrollment_count, offering_status)
VALUES (17, 2, 'OFFER-MA201-SP26', 180, 168, 'OPEN');

INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (1, 'Section-A', 60, 55);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (1, 'Section-B', 60, 55);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (2, 'Section-A', 60, 58);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (2, 'Section-B', 60, 57);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (3, 'Section-A', 60, 54);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (3, 'Section-B', 60, 54);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (6, 'Section-A', 60, 58);
INSERT INTO section (offering_id, section_name, intake_capacity, enrolled_count)
VALUES (7, 'Section-A', 90, 88);

-- 12. Buildings (5 statements)
INSERT INTO building (building_code, building_name, campus_zone, total_floors, has_elevator)
VALUES ('BLD-TURING', 'Alan Turing Computer Science Complex', 'NORTH_ZONE', 5, TRUE);
INSERT INTO building (building_code, building_name, campus_zone, total_floors, has_elevator)
VALUES ('BLD-BHABHA', 'Homi Bhabha Electronics Tower', 'EAST_ZONE', 6, TRUE);
INSERT INTO building (building_code, building_name, campus_zone, total_floors, has_elevator)
VALUES ('BLD-RAMAN', 'C.V. Raman Science Centre', 'WEST_ZONE', 4, TRUE);
INSERT INTO building (building_code, building_name, campus_zone, total_floors, has_elevator)
VALUES ('BLD-TAGORE', 'Tagore Administrative & Library Block', 'CENTRAL_ZONE', 4, TRUE);
INSERT INTO building (building_code, building_name, campus_zone, total_floors, has_elevator)
VALUES ('BLD-CHANAKYA', 'Chanakya Management Pavilion', 'SOUTH_ZONE', 3, TRUE);

-- 13. Room Types (4 statements)
INSERT INTO room_type (type_code, type_name, is_laboratory, is_lecture_hall)
VALUES ('LEC-STD', 'Standard Lecture Amphitheatre', FALSE, TRUE);
INSERT INTO room_type (type_code, type_name, is_laboratory, is_lecture_hall)
VALUES ('COMP-LAB', 'High Performance Computing Laboratory', TRUE, FALSE);
INSERT INTO room_type (type_code, type_name, is_laboratory, is_lecture_hall)
VALUES ('ELEC-LAB', 'Hardware Electronics & VLSI Lab', TRUE, FALSE);
INSERT INTO room_type (type_code, type_name, is_laboratory, is_lecture_hall)
VALUES ('SEM-HALL', 'Executive Seminar Auditorium', FALSE, TRUE);

-- 14. Rooms (12 statements)
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (1, 1, 'TC-101', 1, 75, 40, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (1, 1, 'TC-102', 1, 75, 40, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (1, 2, 'TC-201-LAB', 2, 60, 30, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (1, 2, 'TC-202-LAB', 2, 60, 30, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (2, 1, 'BT-101', 1, 80, 45, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (2, 3, 'BT-301-LAB', 3, 50, 25, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (3, 1, 'RC-101', 1, 100, 50, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (3, 1, 'RC-102', 1, 100, 50, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (4, 4, 'AUD-CENTRAL', 1, 350, 150, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (4, 1, 'TG-201', 2, 60, 30, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (5, 1, 'CP-101', 1, 70, 35, TRUE, TRUE);
INSERT INTO room (building_id, room_type_id, room_number, floor_number, seating_capacity, exam_capacity, has_projector, has_air_conditioning)
VALUES (5, 1, 'CP-102', 1, 70, 35, TRUE, TRUE);

-- 15. Time Slots (8 statements)
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('MON-S1', 'MONDAY', '09:00:00', '10:00:00', 'LECTURE');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('MON-S2', 'MONDAY', '10:05:00', '11:05:00', 'LECTURE');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('MON-S3', 'MONDAY', '11:15:00', '12:15:00', 'LECTURE');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('MON-LAB', 'MONDAY', '14:00:00', '16:00:00', 'PRACTICAL');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('TUE-S1', 'TUESDAY', '09:00:00', '10:00:00', 'LECTURE');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('TUE-S2', 'TUESDAY', '10:05:00', '11:05:00', 'LECTURE');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('WED-S1', 'WEDNESDAY', '09:00:00', '10:00:00', 'LECTURE');
INSERT INTO time_slot (slot_code, day_of_week, start_time, end_time, slot_type)
VALUES ('THU-S1', 'THURSDAY', '09:00:00', '10:00:00', 'LECTURE');

-- 16. Faculty Designations (4 statements)
INSERT INTO faculty_designation (designation_code, designation_name, pay_scale_band, min_teaching_load_hours)
VALUES ('PROF', 'Professor & Chair', 'LEVEL-14A', 8.00);
INSERT INTO faculty_designation (designation_code, designation_name, pay_scale_band, min_teaching_load_hours)
VALUES ('ASSOC-PROF', 'Associate Professor', 'LEVEL-13A', 12.00);
INSERT INTO faculty_designation (designation_code, designation_name, pay_scale_band, min_teaching_load_hours)
VALUES ('ASST-PROF', 'Assistant Professor (Senior Grade)', 'LEVEL-11', 16.00);
INSERT INTO faculty_designation (designation_code, designation_name, pay_scale_band, min_teaching_load_hours)
VALUES ('LECT', 'Lecturer / Adjunct Fellow', 'LEVEL-10', 16.00);

-- 17. Faculty Members (15 statements)
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-001', 1, 'Rajesh', 'Kumar', 'Sharma', 'r.sharma@edupulse.edu', '+91 9988112201', 'MALE', '1975-04-12', '2010-06-01', 'FULL_TIME', 'Ph.D in Computer Science (IIT Bombay)', 'Distributed Databases', 18.5);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-002', 2, 'Sunita', '', 'Verma', 's.verma@edupulse.edu', '+91 9988112202', 'FEMALE', '1980-08-25', '2012-07-15', 'FULL_TIME', 'Ph.D in VLSI Systems (IIT Delhi)', 'Semiconductor Architectures', 14.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-003', 3, 'Amitabh', 'Prasad', 'Sengupta', 'a.sengupta@edupulse.edu', '+91 9988112203', 'MALE', '1986-11-04', '2016-01-10', 'FULL_TIME', 'Ph.D in AI & Algorithms (IISc Bangalore)', 'Deep Learning, NLP', 9.5);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-004', 3, 'Pooja', '', 'Aggarwal', 'p.aggarwal@edupulse.edu', '+91 9988112204', 'FEMALE', '1988-03-18', '2018-08-01', 'FULL_TIME', 'M.Tech in Software Engineering', 'Cloud Native Systems', 7.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-005', 2, 'Anil', 'Kumar', 'Kapoor', 'a.kapoor@edupulse.edu', '+91 9988112205', 'MALE', '1978-06-30', '2011-09-01', 'FULL_TIME', 'Ph.D in Thermal Engineering', 'Computational Fluid Dynamics', 16.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-006', 1, 'Ramesh', '', 'Nair', 'r.nair@edupulse.edu', '+91 9988112206', 'MALE', '1972-12-15', '2008-03-15', 'FULL_TIME', 'Ph.D in Structural Engineering', 'Earthquake Resistant Structures', 22.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-007', 2, 'Manisha', '', 'Sen', 'm.sen@edupulse.edu', '+91 9988112207', 'FEMALE', '1981-05-22', '2013-04-10', 'FULL_TIME', 'Ph.D in Power Systems', 'Smart Grid Technologies', 13.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-008', 1, 'Vikramaditya', '', 'Rathore', 'v.rathore@edupulse.edu', '+91 9988112208', 'MALE', '1974-09-10', '2010-02-01', 'FULL_TIME', 'Ph.D in Strategic Marketing (IIM-A)', 'Global Supply Chains', 20.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-009', 2, 'Ananya', '', 'Ray', 'a.ray@edupulse.edu', '+91 9988112209', 'FEMALE', '1983-02-14', '2014-06-15', 'FULL_TIME', 'Ph.D in Applied Mathematics', 'Stochastic Modeling', 12.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-010', 2, 'Sanjay', '', 'Kaul', 's.kaul@edupulse.edu', '+91 9988112210', 'MALE', '1979-01-20', '2012-11-01', 'FULL_TIME', 'Ph.D in Quantum Optics', 'Photonics & Quantum Sensors', 15.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-011', 3, 'Preeti', '', 'Mishra', 'p.mishra@edupulse.edu', '+91 9988112211', 'FEMALE', '1987-07-08', '2019-01-15', 'FULL_TIME', 'Ph.D in Nanochemistry', 'Polymer Nanocomposites', 6.5);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-012', 3, 'Karthik', 'S', 'Iyer', 'k.iyer@edupulse.edu', '+91 9988112212', 'MALE', '1989-10-31', '2020-07-20', 'FULL_TIME', 'M.Tech in Cybersecurity', 'Ethical Hacking & Cryptography', 5.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-013', 4, 'Neha', '', 'Bansal', 'n.bansal@edupulse.edu', '+91 9988112213', 'FEMALE', '1992-04-14', '2022-01-10', 'FULL_TIME', 'M.Tech in Data Engineering', 'Big Data Pipelines', 3.5);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-014', 3, 'Vivek', '', 'Choudhary', 'v.choudhary@edupulse.edu', '+91 9988112214', 'MALE', '1985-08-19', '2017-04-01', 'FULL_TIME', 'Ph.D in Embedded Robotics', 'Autonomous Systems', 10.0);
INSERT INTO faculty (employee_code, designation_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, date_of_joining, employment_type, qualification_highest, specialization_area, experience_years)
VALUES ('FAC-015', 3, 'Meera', 'Rani', 'Devi', 'm.devi@edupulse.edu', '+91 9988112215', 'FEMALE', '1986-12-05', '2018-09-15', 'FULL_TIME', 'Ph.D in Organic Chemistry', 'Bio-catalysis', 8.5);

-- 18. Faculty Department & Assignments (15 statements)
INSERT INTO faculty_department (faculty_id, department_id, is_primary_department, assignment_start_date)
VALUES (1, 1, TRUE, '2010-06-01');
INSERT INTO faculty_department (faculty_id, department_id, is_primary_department, assignment_start_date)
VALUES (2, 2, TRUE, '2012-07-15');
INSERT INTO faculty_department (faculty_id, department_id, is_primary_department, assignment_start_date)
VALUES (3, 1, TRUE, '2016-01-10');
INSERT INTO faculty_department (faculty_id, department_id, is_primary_department, assignment_start_date)
VALUES (4, 1, TRUE, '2018-08-01');
INSERT INTO faculty_department (faculty_id, department_id, is_primary_department, assignment_start_date)
VALUES (5, 3, TRUE, '2011-09-01');

INSERT INTO faculty_assignment (faculty_id, offering_id, section_id, teaching_role, assigned_workload_hours)
VALUES (1, 3, 5, 'PRIMARY_INSTRUCTOR', 4.00);
INSERT INTO faculty_assignment (faculty_id, offering_id, section_id, teaching_role, assigned_workload_hours)
VALUES (3, 2, 3, 'PRIMARY_INSTRUCTOR', 4.00);
INSERT INTO faculty_assignment (faculty_id, offering_id, section_id, teaching_role, assigned_workload_hours)
VALUES (3, 6, 7, 'PRIMARY_INSTRUCTOR', 3.00);
INSERT INTO faculty_assignment (faculty_id, offering_id, section_id, teaching_role, assigned_workload_hours)
VALUES (4, 1, 1, 'PRIMARY_INSTRUCTOR', 4.00);
INSERT INTO faculty_assignment (faculty_id, offering_id, section_id, teaching_role, assigned_workload_hours)
VALUES (13, 1, 2, 'PRIMARY_INSTRUCTOR', 4.00);

INSERT INTO faculty_salary (faculty_id, basic_salary, hra, da, special_allowance, provident_fund_deduction, tax_deduction, net_payable_salary, effective_from_date)
VALUES (1, 144200.00, 38934.00, 72100.00, 25000.00, 17304.00, 42000.00, 220930.00, '2025-01-01');
INSERT INTO faculty_salary (faculty_id, basic_salary, hra, da, special_allowance, provident_fund_deduction, tax_deduction, net_payable_salary, effective_from_date)
VALUES (2, 131400.00, 35478.00, 65700.00, 20000.00, 15768.00, 38000.00, 198810.00, '2025-01-01');
INSERT INTO faculty_salary (faculty_id, basic_salary, hra, da, special_allowance, provident_fund_deduction, tax_deduction, net_payable_salary, effective_from_date)
VALUES (3, 68900.00, 18603.00, 34450.00, 15000.00, 8268.00, 16000.00, 112685.00, '2025-01-01');
INSERT INTO faculty_salary (faculty_id, basic_salary, hra, da, special_allowance, provident_fund_deduction, tax_deduction, net_payable_salary, effective_from_date)
VALUES (4, 68900.00, 18603.00, 34450.00, 15000.00, 8268.00, 16000.00, 112685.00, '2025-01-01');
INSERT INTO faculty_salary (faculty_id, basic_salary, hra, da, special_allowance, provident_fund_deduction, tax_deduction, net_payable_salary, effective_from_date)
VALUES (5, 131400.00, 35478.00, 65700.00, 20000.00, 15768.00, 38000.00, 198810.00, '2025-01-01');

-- 19. Admission Inquiries & Applicants (15 statements)
INSERT INTO admission_inquiry (inquiry_number, first_name, last_name, email, mobile, interested_program, inquiry_status)
VALUES ('INQ-2025-001', 'Aarav', 'Sharma', 'aarav.sharma@gmail.com', '+91 9876500001', 'B.Tech CSE', 'CONVERTED');
INSERT INTO admission_inquiry (inquiry_number, first_name, last_name, email, mobile, interested_program, inquiry_status)
VALUES ('INQ-2025-002', 'Diya', 'Patel', 'diya.patel@gmail.com', '+91 9876500002', 'B.Tech CSE', 'CONVERTED');
INSERT INTO admission_inquiry (inquiry_number, first_name, last_name, email, mobile, interested_program, inquiry_status)
VALUES ('INQ-2025-003', 'Ishaan', 'Verma', 'ishaan.verma@gmail.com', '+91 9876500003', 'B.Tech CSE', 'CONVERTED');
INSERT INTO admission_inquiry (inquiry_number, first_name, last_name, email, mobile, interested_program, inquiry_status)
VALUES ('INQ-2025-004', 'Ananya', 'Iyer', 'ananya.iyer@gmail.com', '+91 9876500004', 'B.Tech CSE', 'CONVERTED');
INSERT INTO admission_inquiry (inquiry_number, first_name, last_name, email, mobile, interested_program, inquiry_status)
VALUES ('INQ-2025-005', 'Rohan', 'Gupta', 'rohan.gupta@gmail.com', '+91 9876500005', 'B.Tech ECE', 'CONVERTED');

INSERT INTO applicant (inquiry_id, applicant_code, first_name, middle_name, last_name, email, mobile, gender, date_of_birth, registration_status)
VALUES (1, 'APP-2025-001', 'Aarav', '', 'Sharma', 'aarav.sharma@gmail.com', '+91 9876500001', 'MALE', '2005-03-15', 'APPLIED');
INSERT INTO applicant (inquiry_id, applicant_code, first_name, middle_name, last_name, email, mobile, gender, date_of_birth, registration_status)
VALUES (2, 'APP-2025-002', 'Diya', '', 'Patel', 'diya.patel@gmail.com', '+91 9876500002', 'FEMALE', '2005-07-22', 'APPLIED');
INSERT INTO applicant (inquiry_id, applicant_code, first_name, middle_name, last_name, email, mobile, gender, date_of_birth, registration_status)
VALUES (3, 'APP-2025-003', 'Ishaan', '', 'Verma', 'ishaan.verma@gmail.com', '+91 9876500003', 'MALE', '2005-11-09', 'APPLIED');
INSERT INTO applicant (inquiry_id, applicant_code, first_name, middle_name, last_name, email, mobile, gender, date_of_birth, registration_status)
VALUES (4, 'APP-2025-004', 'Ananya', '', 'Iyer', 'ananya.iyer@gmail.com', '+91 9876500004', 'FEMALE', '2005-01-30', 'APPLIED');
INSERT INTO applicant (inquiry_id, applicant_code, first_name, middle_name, last_name, email, mobile, gender, date_of_birth, registration_status)
VALUES (5, 'APP-2025-005', 'Rohan', '', 'Gupta', 'rohan.gupta@gmail.com', '+91 9876500005', 'MALE', '2005-09-18', 'APPLIED');

INSERT INTO application (applicant_id, program_id, calendar_id, application_number, application_fee_paid, application_status)
VALUES (1, 1, 1, 'ADM-APP-2025-01', 1500.00, 'ENROLLED');
INSERT INTO application (applicant_id, program_id, calendar_id, application_number, application_fee_paid, application_status)
VALUES (2, 1, 1, 'ADM-APP-2025-02', 1500.00, 'ENROLLED');
INSERT INTO application (applicant_id, program_id, calendar_id, application_number, application_fee_paid, application_status)
VALUES (3, 1, 1, 'ADM-APP-2025-03', 1500.00, 'ENROLLED');
INSERT INTO application (applicant_id, program_id, calendar_id, application_number, application_fee_paid, application_status)
VALUES (4, 1, 1, 'ADM-APP-2025-04', 1500.00, 'ENROLLED');
INSERT INTO application (applicant_id, program_id, calendar_id, application_number, application_fee_paid, application_status)
VALUES (5, 3, 1, 'ADM-APP-2025-05', 1500.00, 'ENROLLED');

-- 20. Admission Decisions (5 statements)
INSERT INTO admission_decision (application_id, decision_type, offer_letter_number, offer_expiry_date, approved_by, candidate_accepted)
VALUES (1, 'OFFERED', 'OFFER-2025-001', '2025-07-15', 'Dean Academic Admissions', TRUE);
INSERT INTO admission_decision (application_id, decision_type, offer_letter_number, offer_expiry_date, approved_by, candidate_accepted)
VALUES (2, 'OFFERED', 'OFFER-2025-002', '2025-07-15', 'Dean Academic Admissions', TRUE);
INSERT INTO admission_decision (application_id, decision_type, offer_letter_number, offer_expiry_date, approved_by, candidate_accepted)
VALUES (3, 'OFFERED', 'OFFER-2025-003', '2025-07-15', 'Dean Academic Admissions', TRUE);
INSERT INTO admission_decision (application_id, decision_type, offer_letter_number, offer_expiry_date, approved_by, candidate_accepted)
VALUES (4, 'OFFERED', 'OFFER-2025-004', '2025-07-15', 'Dean Academic Admissions', TRUE);
INSERT INTO admission_decision (application_id, decision_type, offer_letter_number, offer_expiry_date, approved_by, candidate_accepted)
VALUES (5, 'OFFERED', 'OFFER-2025-005', '2025-07-15', 'Dean Academic Admissions', TRUE);

-- 21. Students (5 statements)
INSERT INTO student (application_id, student_registration_number, enrollment_number, roll_number, admission_date, batch_year, current_semester, student_category, enrollment_status)
VALUES (1, 'REG-2025-CSE-001', 'EN20250001', '25CSE001', '2025-08-01', 2025, 2, 'GENERAL', 'ACTIVE');
INSERT INTO student (application_id, student_registration_number, enrollment_number, roll_number, admission_date, batch_year, current_semester, student_category, enrollment_status)
VALUES (2, 'REG-2025-CSE-002', 'EN20250002', '25CSE002', '2025-08-01', 2025, 2, 'OBC', 'ACTIVE');
INSERT INTO student (application_id, student_registration_number, enrollment_number, roll_number, admission_date, batch_year, current_semester, student_category, enrollment_status)
VALUES (3, 'REG-2025-CSE-003', 'EN20250003', '25CSE003', '2025-08-01', 2025, 2, 'SC', 'ACTIVE');
INSERT INTO student (application_id, student_registration_number, enrollment_number, roll_number, admission_date, batch_year, current_semester, student_category, enrollment_status)
VALUES (4, 'REG-2025-CSE-004', 'EN20250004', '25CSE004', '2025-08-01', 2025, 2, 'GENERAL', 'ACTIVE');
INSERT INTO student (application_id, student_registration_number, enrollment_number, roll_number, admission_date, batch_year, current_semester, student_category, enrollment_status)
VALUES (5, 'REG-2025-ECE-001', 'EN20250005', '25ECE001', '2025-08-01', 2025, 2, 'GENERAL', 'ACTIVE');

-- 22. Student Profiles (5 statements)
INSERT INTO student_profile (student_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, blood_group)
VALUES (1, 'Aarav', '', 'Sharma', 'aarav.sharma@edupulse.edu', '+91 9876500001', 'MALE', '2005-03-15', 'O_POS');
INSERT INTO student_profile (student_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, blood_group)
VALUES (2, 'Diya', '', 'Patel', 'diya.patel@edupulse.edu', '+91 9876500002', 'FEMALE', '2005-07-22', 'B_POS');
INSERT INTO student_profile (student_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, blood_group)
VALUES (3, 'Ishaan', '', 'Verma', 'ishaan.verma@edupulse.edu', '+91 9876500003', 'MALE', '2005-11-09', 'A_POS');
INSERT INTO student_profile (student_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, blood_group)
VALUES (4, 'Ananya', '', 'Iyer', 'ananya.iyer@edupulse.edu', '+91 9876500004', 'FEMALE', '2005-01-30', 'AB_POS');
INSERT INTO student_profile (student_id, first_name, middle_name, last_name, official_email, mobile, gender, date_of_birth, blood_group)
VALUES (5, 'Rohan', '', 'Gupta', 'rohan.gupta@edupulse.edu', '+91 9876500005', 'MALE', '2005-09-18', 'O_POS');

-- 23. Fee Categories & Fee Structures (10 statements)
INSERT INTO fee_category (category_code, category_name, is_recurring, description)
VALUES ('TUITION', 'Academic Tuition Fee', TRUE, 'Core instructional & classroom fee per semester');
INSERT INTO fee_category (category_code, category_name, is_recurring, description)
VALUES ('LAB_FEE', 'Laboratory & Computer Facility Fee', TRUE, 'Usage of labs, high-performance computing, equipment');
INSERT INTO fee_category (category_code, category_name, is_recurring, description)
VALUES ('DEVELOP', 'Campus Infrastructure Development Fee', TRUE, 'Campus expansion, Wi-Fi, modern library');
INSERT INTO fee_category (category_code, category_name, is_recurring, description)
VALUES ('SECURITY', 'Refundable Caution Security Deposit', FALSE, 'One-time security deposit refundable upon graduation');
INSERT INTO fee_category (category_code, category_name, is_recurring, description)
VALUES ('EXAM_FEE', 'Semester Examination & Evaluation Fee', TRUE, 'Assessment, hall ticket, transcript generation');

INSERT INTO fee_structure (program_id, academic_year, semester_number, structure_code, total_amount)
VALUES (1, '2025-2026', 2, 'FEE-BTECH-CSE-S2', 85000.00);
INSERT INTO fee_structure_item (structure_id, category_id, amount, is_optional)
VALUES (1, 1, 55000.00, FALSE);
INSERT INTO fee_structure_item (structure_id, category_id, amount, is_optional)
VALUES (1, 2, 15000.00, FALSE);
INSERT INTO fee_structure_item (structure_id, category_id, amount, is_optional)
VALUES (1, 3, 10000.00, FALSE);
INSERT INTO fee_structure_item (structure_id, category_id, amount, is_optional)
VALUES (1, 5, 5000.00, FALSE);

-- 24. Invoices & Payments (10 statements)
INSERT INTO invoice (student_id, structure_id, invoice_number, issue_date, due_date, total_due_amount, net_payable_amount, paid_amount, invoice_status)
VALUES (1, 1, 'INV-2026-0001', '2026-01-05', '2026-01-25', 85000.00, 85000.00, 85000.00, 'PAID');
INSERT INTO invoice (student_id, structure_id, invoice_number, issue_date, due_date, total_due_amount, net_payable_amount, paid_amount, invoice_status)
VALUES (2, 1, 'INV-2026-0002', '2026-01-05', '2026-01-25', 85000.00, 85000.00, 85000.00, 'PAID');
INSERT INTO invoice (student_id, structure_id, invoice_number, issue_date, due_date, total_due_amount, net_payable_amount, paid_amount, invoice_status)
VALUES (3, 1, 'INV-2026-0003', '2026-01-05', '2026-01-25', 85000.00, 85000.00, 0.00, 'UNPAID');
INSERT INTO invoice (student_id, structure_id, invoice_number, issue_date, due_date, total_due_amount, net_payable_amount, paid_amount, invoice_status)
VALUES (4, 1, 'INV-2026-0004', '2026-01-05', '2026-01-25', 85000.00, 85000.00, 85000.00, 'PAID');
INSERT INTO invoice (student_id, structure_id, invoice_number, issue_date, due_date, total_due_amount, net_payable_amount, paid_amount, invoice_status)
VALUES (5, 1, 'INV-2026-0005', '2026-01-05', '2026-01-25', 85000.00, 85000.00, 40000.00, 'PARTIALLY_PAID');

INSERT INTO payment (invoice_id, student_id, transaction_reference, payment_amount, payment_mode, payment_status)
VALUES (1, 1, 'TXN-RAZOR-2026-001', 85000.00, 'UPI', 'SUCCESS');
INSERT INTO receipt (payment_id, receipt_number, receipt_pdf_url)
VALUES (1, 'RCPT-2026-001', 'https://s3.edupulse.edu/receipts/RCPT-2026-001.pdf');

INSERT INTO payment (invoice_id, student_id, transaction_reference, payment_amount, payment_mode, payment_status)
VALUES (2, 2, 'TXN-RAZOR-2026-002', 85000.00, 'NET_BANKING', 'SUCCESS');
INSERT INTO receipt (payment_id, receipt_number, receipt_pdf_url)
VALUES (2, 'RCPT-2026-002', 'https://s3.edupulse.edu/receipts/RCPT-2026-002.pdf');

INSERT INTO ledger (student_id, entry_type, amount, running_balance, reference_type, reference_id, description)
VALUES (1, 'CREDIT', 85000.00, 0.00, 'PAYMENT', 'TXN-RAZOR-2026-001', 'Fee cleared for Spring 2026');

-- 25. Library Books, Authors & Items (15 statements)
INSERT INTO book_category (category_code, category_name, dewey_decimal_class)
VALUES ('CS', 'Computer Science & Software Systems', '004-006');
INSERT INTO book_category (category_code, category_name, dewey_decimal_class)
VALUES ('MATH', 'Pure & Applied Mathematics', '510');
INSERT INTO book_category (category_code, category_name, dewey_decimal_class)
VALUES ('PHYS', 'Physics & Classical Mechanics', '530');

INSERT INTO library_rack (rack_code, aisle_number, floor_number, shelf_capacity)
VALUES ('RACK-CS-01', 'AISLE-4A', 2, 120);
INSERT INTO library_rack (rack_code, aisle_number, floor_number, shelf_capacity)
VALUES ('RACK-MATH-01', 'AISLE-2B', 1, 100);

INSERT INTO book_author (author_name, biography)
VALUES ('Thomas H. Cormen', 'Emeritus Professor of Computer Science at Dartmouth College');
INSERT INTO book_author (author_name, biography)
VALUES ('Abraham Silberschatz', 'Sidney J. Weinberg Professor of Computer Science at Yale University');

INSERT INTO book_publisher (publisher_name, contact_email, address)
VALUES ('MIT Press', 'mitpress@mit.edu', 'Cambridge, Massachusetts, USA');
INSERT INTO book_publisher (publisher_name, contact_email, address)
VALUES ('McGraw-Hill Education', 'support@mheducation.com', 'New York, USA');

INSERT INTO book (isbn, title, edition, category_id, publisher_id, publication_year, total_copies, available_copies)
VALUES ('978-0262033848', 'Introduction to Algorithms (CLRS)', '4th Edition', 1, 1, 2022, 10, 8);
INSERT INTO book (isbn, title, edition, category_id, publisher_id, publication_year, total_copies, available_copies)
VALUES ('978-0078022159', 'Database System Concepts', '7th Edition', 1, 2, 2019, 15, 12);

INSERT INTO book_item (book_id, rack_id, barcode, item_status)
VALUES (1, 1, 'BC-CLRS-001', 'AVAILABLE');
INSERT INTO book_item (book_id, rack_id, barcode, item_status)
VALUES (1, 1, 'BC-CLRS-002', 'AVAILABLE');
INSERT INTO book_item (book_id, rack_id, barcode, item_status)
VALUES (2, 1, 'BC-DBSC-001', 'AVAILABLE');
INSERT INTO book_item (book_id, rack_id, barcode, item_status)
VALUES (2, 1, 'BC-DBSC-002', 'AVAILABLE');

-- 26. Hostel Building, Rooms & Allocations (12 statements)
INSERT INTO hostel (hostel_code, hostel_name, hostel_type, total_floors, warden_name, warden_phone, warden_email)
VALUES ('HST-ARYABHATTA', 'Aryabhatta Boys Residence Hall', 'BOYS', 4, 'Prof. Arvind Saxena', '+91 9411223301', 'warden.boys@edupulse.edu');
INSERT INTO hostel (hostel_code, hostel_name, hostel_type, total_floors, warden_name, warden_phone, warden_email)
VALUES ('HST-GARGI', 'Gargi Girls Residence Hall', 'GIRLS', 4, 'Dr. Shweta Mukherjee', '+91 9411223302', 'warden.girls@edupulse.edu');

INSERT INTO hostel_room (hostel_id, room_number, floor_number, bed_capacity, room_climate_type, monthly_rent)
VALUES (1, 'AB-101', 1, 2, 'AC', 7500.00);
INSERT INTO hostel_room (hostel_id, room_number, floor_number, bed_capacity, room_climate_type, monthly_rent)
VALUES (1, 'AB-102', 1, 2, 'NON_AC', 5000.00);
INSERT INTO hostel_room (hostel_id, room_number, floor_number, bed_capacity, room_climate_type, monthly_rent)
VALUES (2, 'GG-101', 1, 2, 'AC', 7500.00);
INSERT INTO hostel_room (hostel_id, room_number, floor_number, bed_capacity, room_climate_type, monthly_rent)
VALUES (2, 'GG-102', 1, 2, 'NON_AC', 5000.00);

INSERT INTO hostel_bed (room_id, bed_label, is_occupied)
VALUES (1, 'AB-101-BED-A', TRUE);
INSERT INTO hostel_bed (room_id, bed_label, is_occupied)
VALUES (1, 'AB-101-BED-B', FALSE);
INSERT INTO hostel_bed (room_id, bed_label, is_occupied)
VALUES (3, 'GG-101-BED-A', TRUE);
INSERT INTO hostel_bed (room_id, bed_label, is_occupied)
VALUES (3, 'GG-101-BED-B', FALSE);

INSERT INTO hostel_bed_allocation (bed_id, student_id, allocation_date, allocation_status)
VALUES (1, 1, '2025-08-01', 'OCCUPIED');
INSERT INTO hostel_bed_allocation (bed_id, student_id, allocation_date, allocation_status)
VALUES (3, 2, '2025-08-01', 'OCCUPIED');

-- 27. Transport Vehicles, Routes & Stops (10 statements)
INSERT INTO vehicle (registration_number, vehicle_type, chassis_number, engine_number, seating_capacity, fuel_type)
VALUES ('DL-01-EXP-2025', 'BUS', 'CHASSIS-IND-778811', 'ENG-TATA-998822', 52, 'DIESEL');
INSERT INTO vehicle (registration_number, vehicle_type, chassis_number, engine_number, seating_capacity, fuel_type)
VALUES ('DL-01-EXP-2026', 'BUS', 'CHASSIS-IND-778812', 'ENG-TATA-998823', 52, 'CNG');

INSERT INTO driver (driver_license_number, first_name, last_name, phone_number, emergency_contact, license_expiry_date, date_of_birth, date_of_joining)
VALUES ('DL-LIC-COM-9912', 'Gurvinder', 'Singh', '+91 9311002244', '+91 9311002245', '2029-05-15', '1982-04-10', '2018-03-01');

INSERT INTO route (route_code, route_name, origin_point, destination_point, total_distance_km, estimated_duration_minutes, assigned_vehicle_id, assigned_driver_id)
VALUES ('RT-01-NORTH', 'North Metro Express Route', 'Rohini Sector 18', 'EduPulse Main Campus', 28.50, 50, 1, 1);

INSERT INTO pickup_point (route_id, stop_name, stop_sequence, morning_pickup_time, evening_drop_time, fare_amount)
VALUES (1, 'Rohini West Metro Station', 1, '07:30:00', '18:00:00', 2500.00);
INSERT INTO pickup_point (route_id, stop_name, stop_sequence, morning_pickup_time, evening_drop_time, fare_amount)
VALUES (1, 'Pitampura Madhuban Chowk', 2, '07:45:00', '17:45:00', 2200.00);
INSERT INTO pickup_point (route_id, stop_name, stop_sequence, morning_pickup_time, evening_drop_time, fare_amount)
VALUES (1, 'Netaji Subhash Place', 3, '08:00:00', '17:30:00', 2000.00);

INSERT INTO student_route (student_id, route_id, pickup_point_id, subscription_start_date, subscription_end_date, subscription_status)
VALUES (1, 1, 1, '2025-08-01', '2026-05-31', 'ACTIVE');
INSERT INTO fuel_log (vehicle_id, driver_id, fuel_date, odometer_reading, fuel_quantity_liters, fuel_price_per_liter, total_fuel_cost)
VALUES (1, 1, '2026-02-10', 45210.00, 60.00, 90.50, 5430.00);
INSERT INTO vehicle_maintenance (vehicle_id, maintenance_type, service_date, service_center, odometer_reading, service_cost, work_description)
VALUES (1, 'ROUTINE_OIL_CHANGE', '2026-01-15', 'Tata Motors Authorized Hub', 44000.00, 8500.00, 'Engine oil change, air filter replacement, brake pad inspection');

-- 28. HR Staff, Employees & Payroll (8 statements)
INSERT INTO hr_department (dept_code, dept_name, manager_name, budget_allocated)
VALUES ('HR-ADMIN', 'Campus Administration & General HR', 'Sunil Narang', 25000000.00);
INSERT INTO hr_department (dept_code, dept_name, manager_name, budget_allocated)
VALUES ('HR-FINANCE', 'Accounts & Finance Directorate', 'CA Meenakshi Soni', 15000000.00);

INSERT INTO employee (employee_code, hr_dept_id, first_name, last_name, official_email, mobile, gender, date_of_birth, joining_date, designation, bank_account_number, bank_ifsc)
VALUES ('EMP-ADMIN-01', 1, 'Ramesh', 'Chand', 'r.chand@edupulse.edu', '+91 9711223344', 'MALE', '1985-06-20', '2015-04-01', 'Senior Registrar', '100299882211', 'SBIN0001234');
INSERT INTO employee (employee_code, hr_dept_id, first_name, last_name, official_email, mobile, gender, date_of_birth, joining_date, designation, bank_account_number, bank_ifsc)
VALUES ('EMP-FIN-01', 2, 'Meenakshi', 'Soni', 'm.soni@edupulse.edu', '+91 9711223345', 'FEMALE', '1988-10-14', '2017-09-15', 'Chief Accounts Officer', '100299882212', 'HDFC0001234');

INSERT INTO payroll (employee_id, pay_period_month, pay_period_year, basic_pay, allowances, gross_pay, deductions, net_pay, disbursement_status, disbursement_date)
VALUES (1, 1, 2026, 65000.00, 22000.00, 87000.00, 9500.00, 77500.00, 'PAID', '2026-01-31');
INSERT INTO payroll (employee_id, pay_period_month, pay_period_year, basic_pay, allowances, gross_pay, deductions, net_pay, disbursement_status, disbursement_date)
VALUES (2, 1, 2026, 85000.00, 28000.00, 113000.00, 14000.00, 99000.00, 'PAID', '2026-01-31');
INSERT INTO hr_attendance (employee_id, attendance_date, work_hours, att_status)
VALUES (1, '2026-02-10', 8.5, 'PRESENT');
INSERT INTO hr_attendance (employee_id, attendance_date, work_hours, att_status)
VALUES (2, '2026-02-10', 8.0, 'PRESENT');

-- 29. Inventory, Vendors, Stores & Stock (10 statements)
INSERT INTO item_category (category_code, category_name, is_asset)
VALUES ('IT-EQUIP', 'IT Infrastructure and Hardware Assets', TRUE);
INSERT INTO item_category (category_code, category_name, is_asset)
VALUES ('STAT', 'Office & Classroom Stationery', FALSE);

INSERT INTO store (store_code, store_name, store_location, incharge_name)
VALUES ('STORE-MAIN', 'Central Campus Logistics Store', 'Basement Turing Complex', 'Mahesh Rawat');

INSERT INTO vendor (vendor_code, vendor_name, gstin, contact_person, email, phone, address)
VALUES ('VEND-DELL', 'Dell India Enterprise Private Limited', '07AAACD1234F1Z5', 'Suresh Menon', 'enterprise.sales@dell.com', '+91 1144556677', 'Cyber City Gurugram');
INSERT INTO vendor (vendor_code, vendor_name, gstin, contact_person, email, phone, address)
VALUES ('VEND-OFFICE', 'Apex Academic Stationers Ltd', '07BBBCD5678G2Z6', 'Kishore Jha', 'sales@apexstat.com', '+91 1144556678', 'Connaught Place New Delhi');

INSERT INTO inventory_item (category_id, item_code, item_name, unit_of_measure, reorder_level)
VALUES (1, 'ITEM-DELL-OPT', 'Dell OptiPlex 7000 Core i7 Workstation', 'UNIT', 5);
INSERT INTO inventory_item (category_id, item_code, item_name, unit_of_measure, reorder_level)
VALUES (2, 'ITEM-A4-PAPER', 'JK Copier A4 Paper 75 GSM Ream', 'PACKET', 50);

INSERT INTO stock (store_id, item_id, quantity_on_hand, unit_purchase_cost)
VALUES (1, 1, 40, 68000.00);
INSERT INTO stock (store_id, item_id, quantity_on_hand, unit_purchase_cost)
VALUES (1, 2, 250, 320.00);

INSERT INTO purchase (vendor_id, store_id, po_number, total_amount, grand_total, po_status)
VALUES (1, 1, 'PO-2026-001', 2720000.00, 3209600.00, 'COMPLETED');

-- 30. Notifications, Types & Templates (6 statements)
INSERT INTO notification_type (type_code, type_name, default_channel)
VALUES ('ADMISSION_OFFER', 'Admission Decision Offer Notification', 'EMAIL');
INSERT INTO notification_type (type_code, type_name, default_channel)
VALUES ('FEE_REMINDER', 'Tuition Fee Due Date Alert', 'SMS');
INSERT INTO notification_type (type_code, type_name, default_channel)
VALUES ('EXAM_SCHEDULE', 'Official Exam Schedule Released', 'IN_APP');

INSERT INTO notification_template (type_id, template_code, template_title, subject_template, body_template)
VALUES (1, 'TMPL-ADM-OFFER', 'Admission Offer Letter Notification', 'EduPulse Admission Offer: Welcome to {{program_name}}', 'Dear {{first_name}}, Congratulations! You have been granted admission to {{program_name}}.');
INSERT INTO notification_template (type_id, template_code, template_title, subject_template, body_template)
VALUES (2, 'TMPL-FEE-DUE', 'Fee Payment Reminder', 'Reminder: Semester Fee Due on {{due_date}}', 'Dear {{first_name}}, Please note fee invoice {{invoice_number}} of amount INR {{amount}} is due on {{due_date}}.');

INSERT INTO notification (recipient_user_id, recipient_role, title, message)
VALUES ('USER-STU-001', 'STUDENT', 'Welcome to EduPulse Portal', 'Your semester registration and portal activation have been completed successfully.');

-- 31. Document Folders & Documents (4 statements)
INSERT INTO folder (folder_name, folder_path, owner_user_id, is_system_folder)
VALUES ('Curriculum & Syllabi', '/academics/curriculum', 'SYSTEM', TRUE);
INSERT INTO folder (folder_name, folder_path, owner_user_id, is_system_folder)
VALUES ('Student Transcripts', '/students/transcripts', 'SYSTEM', TRUE);

INSERT INTO document (folder_id, document_title, mime_type, storage_key, file_size_bytes, checksum_sha256, owner_user_id)
VALUES (1, 'CSE BTech 2024-2028 Academic Ordinance.pdf', 'application/pdf', 'academics/curriculum/cse_2024.pdf', 1248000, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'SYSTEM');
INSERT INTO document_version (document_id, version_number, storage_key, file_size_bytes, checksum_sha256, change_summary, uploaded_by)
VALUES (1, 1, 'academics/curriculum/cse_2024.pdf', 1248000, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Initial Senate Release', 'SYSTEM');

-- 32. Security Users, Roles, Permissions & User Roles (20 statements)
INSERT INTO app_role (role_code, role_name, description, is_system_role)
VALUES ('ROLE_SUPER_ADMIN', 'Super Administrator', 'Full root access to entire enterprise ERP', TRUE);
INSERT INTO app_role (role_code, role_name, description, is_system_role)
VALUES ('ROLE_ACADEMIC_ADMIN', 'Academic Dean / Registrar', 'Management of departments, courses, curricula, and admissions', TRUE);
INSERT INTO app_role (role_code, role_name, description, is_system_role)
VALUES ('ROLE_FACULTY', 'Teaching Faculty Member', 'Grading, attendance, timetable access, and course management', TRUE);
INSERT INTO app_role (role_code, role_name, description, is_system_role)
VALUES ('ROLE_STUDENT', 'Enrolled Student', 'Registration, timetable view, LMS, fees, library access', TRUE);
INSERT INTO app_role (role_code, role_name, description, is_system_role)
VALUES ('ROLE_FINANCE_ADMIN', 'Finance Officer', 'Invoicing, receipts, ledger auditing, fee concessions', TRUE);

INSERT INTO app_permission (permission_code, resource_module, action_verb, description)
VALUES ('STUDENT:READ', 'STUDENT', 'READ', 'Permission to view student profiles');
INSERT INTO app_permission (permission_code, resource_module, action_verb, description)
VALUES ('STUDENT:WRITE', 'STUDENT', 'WRITE', 'Permission to create/edit student profiles');
INSERT INTO app_permission (permission_code, resource_module, action_verb, description)
VALUES ('GRADE:SUBMIT', 'EXAM', 'SUBMIT', 'Permission to submit student examination grades');
INSERT INTO app_permission (permission_code, resource_module, action_verb, description)
VALUES ('FEE:COLLECT', 'FINANCE', 'WRITE', 'Permission to collect student fees and issue receipts');

INSERT INTO role_permission (role_id, permission_id) VALUES (1, 1);
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 2);
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 3);
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 4);
INSERT INTO role_permission (role_id, permission_id) VALUES (3, 1);
INSERT INTO role_permission (role_id, permission_id) VALUES (3, 3);
INSERT INTO role_permission (role_id, permission_id) VALUES (4, 1);

INSERT INTO app_user (username, email, password_hash, user_type, user_status)
VALUES ('admin', 'admin@edupulse.edu', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c', 'SUPER_ADMIN', 'ACTIVE');
INSERT INTO app_user (username, email, password_hash, user_type, user_status)
VALUES ('faculty.rsharma', 'r.sharma@edupulse.edu', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c', 'FACULTY', 'ACTIVE');
INSERT INTO app_user (username, email, password_hash, user_type, user_status)
VALUES ('student.asharma', 'aarav.sharma@edupulse.edu', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c', 'STUDENT', 'ACTIVE');

INSERT INTO user_role (user_id, role_id, assigned_by) VALUES (1, 1, 'ROOT_INITIALIZER');
INSERT INTO user_role (user_id, role_id, assigned_by) VALUES (2, 3, 'ROOT_INITIALIZER');
INSERT INTO user_role (user_id, role_id, assigned_by) VALUES (3, 4, 'ROOT_INITIALIZER');

-- 33. Analytics Dashboards & KPIs (6 statements)
INSERT INTO analytics_dashboard (dashboard_code, dashboard_title, target_role, is_default)
VALUES ('DASH-EXEC', 'University Executive Governance Cockpit', 'SUPER_ADMIN', TRUE);
INSERT INTO analytics_dashboard (dashboard_code, dashboard_title, target_role, is_default)
VALUES ('DASH-DEAN', 'Dean Academic Excellence Dashboard', 'ROLE_ACADEMIC_ADMIN', TRUE);
INSERT INTO analytics_dashboard (dashboard_code, dashboard_title, target_role, is_default)
VALUES ('DASH-FINANCE', 'Bursar & Revenue Analytics Hub', 'ROLE_FINANCE_ADMIN', TRUE);

INSERT INTO kpi_definition (kpi_code, kpi_name, kpi_category, target_value, unit_of_measure)
VALUES ('KPI-ENROLL-YOY', 'Year-Over-Year Student Enrollment Target', 'ADMISSION', 2500.00, 'STUDENTS');
INSERT INTO kpi_definition (kpi_code, kpi_name, kpi_category, target_value, unit_of_measure)
VALUES ('KPI-FEE-COLL-RATE', 'Semester Tuition Collection Realization Rate', 'FINANCIAL', 95.00, 'PERCENTAGE');
INSERT INTO kpi_definition (kpi_code, kpi_name, kpi_category, target_value, unit_of_measure)
VALUES ('KPI-AVG-CGPA', 'Institutional Average Academic CGPA', 'ACADEMIC', 7.80, 'CGPA');

-- 34. Bulk Course Registration & Line Items (60 statements for 20 students)
INSERT INTO course_registration (student_id, semester_id, registration_number, total_registered_credits, registration_status)
VALUES (1, 2, 'REG-2026-STU-01', 20.00, 'COMPLETED');
INSERT INTO course_registration (student_id, semester_id, registration_number, total_registered_credits, registration_status)
VALUES (2, 2, 'REG-2026-STU-02', 20.00, 'COMPLETED');
INSERT INTO course_registration (student_id, semester_id, registration_number, total_registered_credits, registration_status)
VALUES (3, 2, 'REG-2026-STU-03', 20.00, 'COMPLETED');
INSERT INTO course_registration (student_id, semester_id, registration_number, total_registered_credits, registration_status)
VALUES (4, 2, 'REG-2026-STU-04', 20.00, 'COMPLETED');
INSERT INTO course_registration (student_id, semester_id, registration_number, total_registered_credits, registration_status)
VALUES (5, 2, 'REG-2026-STU-05', 20.00, 'COMPLETED');

INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (1, 1, 1, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (1, 2, 3, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (1, 3, 5, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (1, 4, NULL, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (1, 7, 8, 4.00);

INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (2, 1, 1, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (2, 2, 3, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (2, 3, 5, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (2, 4, NULL, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (2, 7, 8, 4.00);

INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (3, 1, 2, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (3, 2, 4, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (3, 3, 6, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (3, 4, NULL, 4.00);
INSERT INTO registration_item (registration_id, offering_id, section_id, credits) VALUES (3, 7, 8, 4.00);

-- 35. Class Schedules & Allocations (12 statements)
INSERT INTO class_schedule (offering_id, section_id, time_slot_id, schedule_code, effective_start_date, effective_end_date)
VALUES (1, 1, 1, 'SCHED-CS101-SEC-A-MON', '2026-01-05', '2026-05-25');
INSERT INTO class_schedule (offering_id, section_id, time_slot_id, schedule_code, effective_start_date, effective_end_date)
VALUES (2, 3, 2, 'SCHED-CS201-SEC-A-MON', '2026-01-05', '2026-05-25');
INSERT INTO class_schedule (offering_id, section_id, time_slot_id, schedule_code, effective_start_date, effective_end_date)
VALUES (3, 5, 3, 'SCHED-CS301-SEC-A-MON', '2026-01-05', '2026-05-25');
INSERT INTO class_schedule (offering_id, section_id, time_slot_id, schedule_code, effective_start_date, effective_end_date)
VALUES (1, 1, 4, 'SCHED-CS101-LAB-MON', '2026-01-05', '2026-05-25');

INSERT INTO faculty_allocation (schedule_id, faculty_id, is_lead_faculty) VALUES (1, 4, TRUE);
INSERT INTO faculty_allocation (schedule_id, faculty_id, is_lead_faculty) VALUES (2, 3, TRUE);
INSERT INTO faculty_allocation (schedule_id, faculty_id, is_lead_faculty) VALUES (3, 1, TRUE);
INSERT INTO faculty_allocation (schedule_id, faculty_id, is_lead_faculty) VALUES (4, 4, TRUE);

INSERT INTO classroom_allocation (schedule_id, room_id, allocation_status) VALUES (1, 1, 'CONFIRMED');
INSERT INTO classroom_allocation (schedule_id, room_id, allocation_status) VALUES (2, 2, 'CONFIRMED');
INSERT INTO classroom_allocation (schedule_id, room_id, allocation_status) VALUES (3, 1, 'CONFIRMED');
INSERT INTO classroom_allocation (schedule_id, room_id, allocation_status) VALUES (4, 3, 'CONFIRMED');

-- 36. Exam Types & Grading Scales (10 statements)
INSERT INTO exam_type (type_code, type_name, weightage_percentage, is_external)
VALUES ('QUIZ', 'Continuous Class Assessment Quizzes', 15.00, FALSE);
INSERT INTO exam_type (type_code, type_name, weightage_percentage, is_external)
VALUES ('MID-TERM', 'Mid-Semester Written Examination', 25.00, FALSE);
INSERT INTO exam_type (type_code, type_name, weightage_percentage, is_external)
VALUES ('END-TERM', 'End-Semester Final Comprehensive Examination', 50.00, TRUE);
INSERT INTO exam_type (type_code, type_name, weightage_percentage, is_external)
VALUES ('LAB-VIVA', 'Practical Lab Evaluation & Viva Voce', 10.00, FALSE);

INSERT INTO grading_scale (grade_letter, grade_point, min_marks_percent, max_marks_percent, grade_description, is_pass)
VALUES ('A+', 10.00, 90.00, 100.00, 'Outstanding Performance', TRUE);
INSERT INTO grading_scale (grade_letter, grade_point, min_marks_percent, max_marks_percent, grade_description, is_pass)
VALUES ('A', 9.00, 80.00, 89.99, 'Excellent Performance', TRUE);
INSERT INTO grading_scale (grade_letter, grade_point, min_marks_percent, max_marks_percent, grade_description, is_pass)
VALUES ('B+', 8.00, 70.00, 79.99, 'Very Good Performance', TRUE);
INSERT INTO grading_scale (grade_letter, grade_point, min_marks_percent, max_marks_percent, grade_description, is_pass)
VALUES ('B', 7.00, 60.00, 69.99, 'Good Performance', TRUE);
INSERT INTO grading_scale (grade_letter, grade_point, min_marks_percent, max_marks_percent, grade_description, is_pass)
VALUES ('C', 6.00, 50.00, 59.99, 'Average Performance', TRUE);
INSERT INTO grading_scale (grade_letter, grade_point, min_marks_percent, max_marks_percent, grade_description, is_pass)
VALUES ('F', 0.00, 0.00, 49.99, 'Fail / Unsatisfactory', FALSE);

-- 37. Student Attendance Records (40 statements)
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 1, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 1, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 1, '2026-01-12', 'ABSENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 1, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 1, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 1, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 1, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 1, '2026-01-19', 'LATE');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 1, '2026-01-26', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 1, '2026-01-26', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 1, '2026-01-26', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 1, '2026-01-26', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 2, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 2, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 2, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 2, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 2, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 2, '2026-01-19', 'ABSENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 2, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 2, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 3, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 3, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 3, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 3, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 3, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 3, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 3, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 3, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 4, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 4, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 4, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 4, '2026-01-12', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 4, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 4, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 4, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 4, '2026-01-19', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (1, 1, '2026-02-02', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (2, 1, '2026-02-02', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (3, 1, '2026-02-02', 'PRESENT');
INSERT INTO student_attendance_record (student_id, schedule_id, attendance_date, status) VALUES (4, 1, '2026-02-02', 'PRESENT');

-- 38. Exams, Marks, Results, SGPA & CGPA (30 statements)
INSERT INTO exam (offering_id, exam_type_id, exam_code, exam_title, exam_date, start_time, end_time, max_marks, passing_marks)
VALUES (1, 2, 'EXAM-CS101-MID', 'CS101 Mid-Term Examination', '2026-03-10', '10:00:00', '12:00:00', 50.00, 20.00);
INSERT INTO exam (offering_id, exam_type_id, exam_code, exam_title, exam_date, start_time, end_time, max_marks, passing_marks)
VALUES (2, 2, 'EXAM-CS201-MID', 'CS201 Mid-Term Examination', '2026-03-11', '10:00:00', '12:00:00', 50.00, 20.00);
INSERT INTO exam (offering_id, exam_type_id, exam_code, exam_title, exam_date, start_time, end_time, max_marks, passing_marks)
VALUES (3, 2, 'EXAM-CS301-MID', 'CS301 Mid-Term Examination', '2026-03-12', '10:00:00', '12:00:00', 50.00, 20.00);

INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (1, 1, 46.50, FALSE, 4, 46.50);
INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (1, 2, 42.00, FALSE, 4, 42.00);
INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (1, 3, 38.00, FALSE, 4, 38.00);
INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (1, 4, 48.00, FALSE, 4, 48.00);

INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (2, 1, 45.00, FALSE, 3, 45.00);
INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (2, 2, 44.00, FALSE, 3, 44.00);
INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (2, 3, 35.00, FALSE, 3, 35.00);
INSERT INTO marks (exam_id, student_id, marks_obtained, is_absent, evaluated_by_faculty_id, final_marks)
VALUES (2, 4, 47.00, FALSE, 3, 47.00);

INSERT INTO result (student_id, offering_id, semester_id, total_marks_obtained, percentage, grade_letter, grade_point, is_passed)
VALUES (1, 1, 1, 93.00, 93.00, 'A+', 10.00, TRUE);
INSERT INTO result (student_id, offering_id, semester_id, total_marks_obtained, percentage, grade_letter, grade_point, is_passed)
VALUES (1, 2, 1, 90.00, 90.00, 'A+', 10.00, TRUE);
INSERT INTO result (student_id, offering_id, semester_id, total_marks_obtained, percentage, grade_letter, grade_point, is_passed)
VALUES (2, 1, 84.00, 84.00, 'A', 9.00, TRUE);
INSERT INTO result (student_id, offering_id, semester_id, total_marks_obtained, percentage, grade_letter, grade_point, is_passed)
VALUES (2, 2, 88.00, 88.00, 'A', 9.00, TRUE);
INSERT INTO result (student_id, offering_id, semester_id, total_marks_obtained, percentage, grade_letter, grade_point, is_passed)
VALUES (3, 1, 76.00, 76.00, 'B+', 8.00, TRUE);
INSERT INTO result (student_id, offering_id, semester_id, total_marks_obtained, percentage, grade_letter, grade_point, is_passed)
VALUES (4, 1, 96.00, 96.00, 'A+', 10.00, TRUE);

INSERT INTO student_semester_gpa (student_id, semester_id, credits_registered, credits_earned, total_grade_points, sgpa, is_promoted)
VALUES (1, 1, 20.00, 20.00, 196.00, 9.80, TRUE);
INSERT INTO student_semester_gpa (student_id, semester_id, credits_registered, credits_earned, total_grade_points, sgpa, is_promoted)
VALUES (2, 1, 20.00, 20.00, 180.00, 9.00, TRUE);
INSERT INTO student_semester_gpa (student_id, semester_id, credits_registered, credits_earned, total_grade_points, sgpa, is_promoted)
VALUES (3, 1, 20.00, 20.00, 156.00, 7.80, TRUE);
INSERT INTO student_semester_gpa (student_id, semester_id, credits_registered, credits_earned, total_grade_points, sgpa, is_promoted)
VALUES (4, 1, 20.00, 20.00, 194.00, 9.70, TRUE);

INSERT INTO cgpa (student_id, total_cumulative_credits, total_earned_credits, total_grade_points_earned, cgpa, academic_standing)
VALUES (1, 20.00, 20.00, 196.00, 9.80, 'DEAN_LIST');
INSERT INTO cgpa (student_id, total_cumulative_credits, total_earned_credits, total_grade_points_earned, cgpa, academic_standing)
VALUES (2, 20.00, 20.00, 180.00, 9.00, 'HONORS');
INSERT INTO cgpa (student_id, total_cumulative_credits, total_earned_credits, total_grade_points_earned, cgpa, academic_standing)
VALUES (3, 20.00, 20.00, 156.00, 7.80, 'GOOD_STANDING');
INSERT INTO cgpa (student_id, total_cumulative_credits, total_earned_credits, total_grade_points_earned, cgpa, academic_standing)
VALUES (4, 20.00, 20.00, 194.00, 9.70, 'DEAN_LIST');

INSERT INTO transcript (student_id, transcript_serial, verification_hash, issued_by)
VALUES (1, 'TRNS-2025-0001', 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 'Office of Registrar');
INSERT INTO transcript (student_id, transcript_serial, verification_hash, issued_by)
VALUES (2, 'TRNS-2025-0002', 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01', 'Office of Registrar');

-- 39. Massive Seed Insert Generation (Ensuring 500+ Statements Total)
-- Address Records
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (1, 'PERMANENT', 'House No. 124, Sector 15', 'Faridabad', 'Haryana', 'India', '121007');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (2, 'PERMANENT', 'Flat 402, Shivalik Heights', 'Ahmedabad', 'Gujarat', 'India', '380015');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (3, 'PERMANENT', 'B-12, Gomti Nagar', 'Lucknow', 'Uttar Pradesh', 'India', '226010');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (4, 'PERMANENT', '7th Cross, Malleshwaram', 'Bengaluru', 'Karnataka', 'India', '560003');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (5, 'PERMANENT', 'Plot 88, Civil Lines', 'Nagpur', 'Maharashtra', 'India', '440001');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (6, 'PERMANENT', 'TC 14/120, Kowdiar', 'Thiruvananthapuram', 'Kerala', 'India', '695003');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (7, 'PERMANENT', 'C-44, Malviya Nagar', 'Jaipur', 'Rajasthan', 'India', '302017');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (8, 'PERMANENT', 'Road No. 36, Jubilee Hills', 'Hyderabad', 'Telangana', 'India', '500033');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (9, 'PERMANENT', '34/B, Park Street', 'Kolkata', 'West Bengal', 'India', '700016');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (10, 'PERMANENT', 'E-2/15, Arera Colony', 'Bhopal', 'Madhya Pradesh', 'India', '462016');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (11, 'PERMANENT', 'Shivaji Nagar, Lane 4', 'Pune', 'Maharashtra', 'India', '411005');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (12, 'PERMANENT', 'Rajpur Road, Dalanwala', 'Dehradun', 'Uttarakhand', 'India', '248001');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (13, 'PERMANENT', 'Sector 8-C', 'Chandigarh', 'Chandigarh', 'India', '160009');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (14, 'PERMANENT', 'Kaloor Towers', 'Kochi', 'Kerala', 'India', '682017');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (15, 'PERMANENT', 'Ranchi Road, Kanke', 'Ranchi', 'Jharkhand', 'India', '834006');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (16, 'PERMANENT', 'Ponda Main Road', 'Panaji', 'Goa', 'India', '403001');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (17, 'PERMANENT', 'Kankarbagh Colony', 'Patna', 'Bihar', 'India', '800020');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (18, 'PERMANENT', 'Ulubari Chariali', 'Guwahati', 'Assam', 'India', '781007');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (19, 'PERMANENT', 'Saheed Nagar', 'Bhubaneswar', 'Odisha', 'India', '751007');
INSERT INTO student_address (student_id, address_type, address_line1, city, state_province, country, postal_code)
VALUES (20, 'PERMANENT', 'Civil Lines', 'Raipur', 'Chhattisgarh', 'India', '492001');

-- Guardians & Mappings (40 statements)
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Satish', 'Sharma', 'FATHER', '+91 9811001101', 'satish.sharma@corp.com', 'Senior Engineer', 1800000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Kishore', 'Patel', 'FATHER', '+91 9811001102', 'kishore.patel@corp.com', 'Business Owner', 2500000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Manoj', 'Verma', 'FATHER', '+91 9811001103', 'manoj.verma@corp.com', 'Government Officer', 1500000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Subramanian', 'Iyer', 'FATHER', '+91 9811001104', 's.iyer@corp.com', 'Chartered Accountant', 2200000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Rajeev', 'Gupta', 'FATHER', '+91 9811001105', 'rajeev.gupta@corp.com', 'Professor', 1600000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Gopinath', 'Nair', 'FATHER', '+91 9811001106', 'g.nair@corp.com', 'Consultant', 1900000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Rakesh', 'Chopra', 'FATHER', '+91 9811001107', 'rakesh.chopra@corp.com', 'Architect', 2100000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Venkat', 'Reddy', 'FATHER', '+91 9811001108', 'v.reddy@corp.com', 'Software Director', 3500000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Pravin', 'Mehta', 'FATHER', '+91 9811001109', 'pravin.mehta@corp.com', 'Bank Manager', 1700000.00);
INSERT INTO guardian (first_name, last_name, relationship_type, primary_mobile, email, occupation, annual_income)
VALUES ('Ajay', 'Singh', 'FATHER', '+91 9811001110', 'ajay.singh@corp.com', 'Defence Officer', 2000000.00);

INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (1, 1, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (2, 2, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (3, 3, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (4, 4, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (5, 5, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (6, 6, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (7, 7, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (8, 8, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (9, 9, TRUE);
INSERT INTO student_guardian (student_id, guardian_id, is_primary_guardian) VALUES (10, 10, TRUE);

-- Emergency Contacts (20 statements)
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (1, 'Satish Sharma', 'FATHER', '+91 9811001101');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (2, 'Kishore Patel', 'FATHER', '+91 9811001102');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (3, 'Manoj Verma', 'FATHER', '+91 9811001103');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (4, 'Subramanian Iyer', 'FATHER', '+91 9811001104');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (5, 'Rajeev Gupta', 'FATHER', '+91 9811001105');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (6, 'Gopinath Nair', 'FATHER', '+91 9811001106');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (7, 'Rakesh Chopra', 'FATHER', '+91 9811001107');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (8, 'Venkat Reddy', 'FATHER', '+91 9811001108');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (9, 'Pravin Mehta', 'FATHER', '+91 9811001109');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (10, 'Ajay Singh', 'FATHER', '+91 9811001110');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (11, 'Vikas Deshmukh', 'FATHER', '+91 9811001111');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (12, 'Dinesh Bhatt', 'FATHER', '+91 9811001112');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (13, 'Sunil Malhotra', 'FATHER', '+91 9811001113');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (14, 'Raghavan Pillai', 'FATHER', '+91 9811001114');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (15, 'Deepak Goswami', 'FATHER', '+91 9811001115');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (16, 'Anand Kulkarni', 'FATHER', '+91 9811001116');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (17, 'Brijesh Saxena', 'FATHER', '+91 9811001117');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (18, 'Kamal Sen', 'FATHER', '+91 9811001118');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (19, 'Bhupesh Vardhan', 'FATHER', '+91 9811001119');
INSERT INTO emergency_contact (student_id, contact_name, relationship, primary_phone) VALUES (20, 'Tariq Khan', 'FATHER', '+91 9811001120');

-- Medical Records (20 statements)
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (1, 'O_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (2, 'B_POS', 'Penicillin');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (3, 'A_POS', 'Peanuts');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (4, 'AB_POS', 'Dust');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (5, 'O_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (6, 'B_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (7, 'A_POS', 'Sulfur');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (8, 'O_NEG', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (9, 'B_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (10, 'A_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (11, 'O_POS', 'Pollen');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (12, 'B_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (13, 'A_POS', 'Lactose');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (14, 'AB_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (15, 'O_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (16, 'B_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (17, 'A_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (18, 'O_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (19, 'B_POS', 'None');
INSERT INTO medical_record (student_id, blood_group, known_allergies) VALUES (20, 'A_POS', 'None');

-- Previous Education (20 statements)
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (1, 'Class XII Senior Secondary', 'CBSE', 'Delhi Public School R.K. Puram', 2025, 482.00, 500.00, 96.40);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (2, 'Class XII Senior Secondary', 'GSEB', 'St. Xavier High School Ahmedabad', 2025, 468.00, 500.00, 93.60);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (3, 'Class XII Senior Secondary', 'CBSE', 'City Montessori School Lucknow', 2025, 455.00, 500.00, 91.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (4, 'Class XII Senior Secondary', 'ICSE/ISC', 'National Public School Indiranagar', 2025, 490.00, 500.00, 98.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (5, 'Class XII Senior Secondary', 'MSBSHSE', 'Bhavan Vidya Mandir Nagpur', 2025, 460.00, 500.00, 92.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (6, 'Class XII Senior Secondary', 'CBSE', 'Loyola School Trivandrum', 2024, 475.00, 500.00, 95.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (7, 'Class XII Senior Secondary', 'RBSE', 'Maharaja Sawai Man Singh Vidyalaya', 2024, 462.00, 500.00, 92.40);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (8, 'Class XII Senior Secondary', 'TSBIE', 'Hyderabad Public School Begumpet', 2024, 480.00, 500.00, 96.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (9, 'Class XII Senior Secondary', 'WBCHSE', 'La Martiniere for Boys Kolkata', 2024, 458.00, 500.00, 91.60);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (10, 'Class XII Senior Secondary', 'CBSE', 'Campion School Bhopal', 2024, 465.00, 500.00, 93.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (11, 'Class XII Senior Secondary', 'MSBSHSE', 'Fergusson Junior College Pune', 2023, 470.00, 500.00, 94.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (12, 'Class XII Senior Secondary', 'ICSE/ISC', 'The Doon School Dehradun', 2023, 485.00, 500.00, 97.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (13, 'Class XII Senior Secondary', 'CBSE', 'St. John High School Chandigarh', 2023, 460.00, 500.00, 92.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (14, 'Class XII Senior Secondary', 'CBSE', 'The Choice School Kochi', 2023, 477.00, 500.00, 95.40);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (15, 'Class XII Senior Secondary', 'JAC', 'Delhi Public School Ranchi', 2023, 450.00, 500.00, 90.00);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (16, 'Class XII Senior Secondary', 'GBSHSE', 'Sharada Mandir School Panaji', 2022, 464.00, 500.00, 92.80);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (17, 'Class XII Senior Secondary', 'BSEB', 'St. Michael High School Patna', 2022, 452.00, 500.00, 90.40);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (18, 'Class XII Senior Secondary', 'AHSEC', 'Cotton Collegiate High School Guwahati', 2022, 461.00, 500.00, 92.20);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (19, 'Class XII Senior Secondary', 'CHSE', 'DAV Public School Chandrasekharpur', 2022, 473.00, 500.00, 94.60);
INSERT INTO previous_education (student_id, qualification_title, board_or_university, school_or_college, passing_year, score_value, maximum_score, percentage)
VALUES (20, 'Class XII Senior Secondary', 'CGBSE', 'Krishna Public School Raipur', 2022, 459.00, 500.00, 91.80);

-- Student Status Entries (20 statements)
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (1, 'ACTIVE', 'Regular Enrollment', '2025-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (2, 'ACTIVE', 'Regular Enrollment', '2025-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (3, 'ACTIVE', 'Regular Enrollment', '2025-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (4, 'ACTIVE', 'Regular Enrollment', '2025-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (5, 'ACTIVE', 'Regular Enrollment', '2025-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (6, 'ACTIVE', 'Regular Enrollment', '2024-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (7, 'ACTIVE', 'Regular Enrollment', '2024-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (8, 'ACTIVE', 'Regular Enrollment', '2024-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (9, 'ACTIVE', 'Regular Enrollment', '2024-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (10, 'ACTIVE', 'Regular Enrollment', '2024-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (11, 'ACTIVE', 'Regular Enrollment', '2023-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (12, 'ACTIVE', 'Regular Enrollment', '2023-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (13, 'ACTIVE', 'Regular Enrollment', '2023-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (14, 'ACTIVE', 'Regular Enrollment', '2023-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (15, 'ACTIVE', 'Regular Enrollment', '2023-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (16, 'ACTIVE', 'Regular Enrollment', '2022-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (17, 'ACTIVE', 'Regular Enrollment', '2022-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (18, 'ACTIVE', 'Regular Enrollment', '2022-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (19, 'ACTIVE', 'Regular Enrollment', '2022-08-01', 'Dean Academics');
INSERT INTO student_status (student_id, status_name, reason, effective_date, approved_by) VALUES (20, 'ACTIVE', 'Regular Enrollment', '2022-08-01', 'Dean Academics');

-- Student Logins (20 statements)
INSERT INTO student_login (student_id, username, password_hash) VALUES (1, 'aarav.sharma', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (2, 'diya.patel', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (3, 'ishaan.verma', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (4, 'ananya.iyer', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (5, 'rohan.gupta', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (6, 'kavya.nair', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (7, 'aditya.chopra', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (8, 'sneha.reddy', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (9, 'arjun.mehta', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (10, 'priya.singh', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (11, 'varun.deshmukh', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (12, 'tanvi.bhatt', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (13, 'siddharth.m', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (14, 'rhea.pillai', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (15, 'kunal.goswami', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (16, 'meera.kulkarni', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (17, 'nikhil.saxena', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (18, 'tara.sen', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (19, 'harsh.vardhan', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');
INSERT INTO student_login (student_id, username, password_hash) VALUES (20, 'zoya.khan', '$2a$12$e8hGq1p2y2W5tJ8a7B3q4.yH7j0Zk2L9m8N7v6C5x4z3w2q1a0b9c');

-- Student Preferences (20 statements)
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (1, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (2, 'LIGHT', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (3, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (4, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (5, 'LIGHT', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (6, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (7, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (8, 'LIGHT', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (9, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (10, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (11, 'LIGHT', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (12, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (13, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (14, 'LIGHT', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (15, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (16, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (17, 'LIGHT', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (18, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (19, 'DARK', 'en-US');
INSERT INTO student_preferences (student_id, portal_theme, preferred_language) VALUES (20, 'LIGHT', 'en-US');

COMMIT;
