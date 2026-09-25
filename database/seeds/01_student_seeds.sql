-- ==============================================================================
-- Institutional ERP v1.0 - Seed Data
-- Demonstrates Students, Guardians, Documents, and Status Records
-- ==============================================================================

-- 1. Insert Initial Students
INSERT INTO students (id, roll_number, first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, city, state, pincode, department, program, batch, enrollment_date, status)
VALUES 
(1, '2023-CSE-001', 'Aarav', 'Sharma', 'aarav.sharma@college.edu', '+919876543210', '2004-06-15', 'MALE', 'O+', 'Flat 402, Sunshine Heights', 'New Delhi', 'Delhi', '110001', 'Computer Science and Engineering', 'B.Tech CSE', '2023-2027', '2023-08-01', 'ACTIVE'),
(2, '2023-CSE-002', 'Diya', 'Mehta', 'diya.mehta@college.edu', '+919876543211', '2004-09-22', 'FEMALE', 'B+', 'House 12, Green Park', 'Bengaluru', 'Karnataka', '560001', 'Computer Science and Engineering', 'B.Tech CSE', '2023-2027', '2023-08-01', 'ACTIVE'),
(3, '2022-ECE-015', 'Rohan', 'Iyer', 'rohan.iyer@college.edu', '+919876543212', '2003-12-05', 'MALE', 'A+', 'Plot 88, Sector 14', 'Chennai', 'Tamil Nadu', '600001', 'Electronics and Communication Engineering', 'B.Tech ECE', '2022-2026', '2022-08-01', 'SUSPENDED'),
(4, '2020-MECH-042', 'Priya', 'Singh', 'priya.singh@college.edu', '+919876543213', '2002-04-18', 'FEMALE', 'AB+', 'Villa 7, Royal Palms', 'Pune', 'Maharashtra', '411001', 'Mechanical Engineering', 'B.Tech ME', '2020-2024', '2020-08-01', 'GRADUATED'),
(5, '2019-CIVIL-009', 'Vikram', 'Rao', 'vikram.rao@college.edu', '+919876543214', '2001-01-30', 'MALE', 'O-', '23 Heritage Lane', 'Hyderabad', 'Telangana', '500001', 'Civil Engineering', 'B.Tech CE', '2019-2023', '2019-08-01', 'ALUMNI')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Guardians
INSERT INTO guardians (id, student_id, first_name, last_name, relation, phone, email, occupation, address, is_emergency_contact)
VALUES
(1, 1, 'Rajesh', 'Sharma', 'FATHER', '+919811223344', 'rajesh.sharma@example.com', 'Senior Software Architect', 'Flat 402, Sunshine Heights, New Delhi', true),
(2, 1, 'Sunita', 'Sharma', 'MOTHER', '+919811223355', 'sunita.sharma@example.com', 'Professor of Mathematics', 'Flat 402, Sunshine Heights, New Delhi', false),
(3, 2, 'Kishore', 'Mehta', 'FATHER', '+919822334455', 'kishore.mehta@example.com', 'Business Executive', 'House 12, Green Park, Bengaluru', true),
(4, 3, 'Venkat', 'Iyer', 'FATHER', '+919833445566', 'venkat.iyer@example.com', 'Bank Manager', 'Plot 88, Sector 14, Chennai', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Document Metadata
INSERT INTO student_documents (id, student_id, document_type, file_name, original_file_name, file_type, file_size, storage_path, uploaded_at)
VALUES
(1, 1, 'AADHAAR', '1_AADHAAR_seed_sample.pdf', 'aadhaar_aarav_sharma.pdf', 'application/pdf', 245760, 'uploads/documents/1_AADHAAR_seed_sample.pdf', CURRENT_TIMESTAMP),
(2, 1, 'MARKSHEET', '1_MARKSHEET_seed_sample.pdf', 'class_12_marksheet.pdf', 'application/pdf', 312000, 'uploads/documents/1_MARKSHEET_seed_sample.pdf', CURRENT_TIMESTAMP),
(3, 1, 'PHOTOGRAPH', '1_PHOTOGRAPH_seed_sample.jpg', 'aarav_passport_photo.jpg', 'image/jpeg', 85400, 'uploads/documents/1_PHOTOGRAPH_seed_sample.jpg', CURRENT_TIMESTAMP),
(4, 2, 'AADHAAR', '2_AADHAAR_seed_sample.pdf', 'aadhaar_diya_mehta.pdf', 'application/pdf', 210400, 'uploads/documents/2_AADHAAR_seed_sample.pdf', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Student Status Audit History
INSERT INTO student_status_history (student_id, previous_status, new_status, reason, changed_by, changed_at)
VALUES
(1, NULL, 'ACTIVE', 'Initial enrollment completed upon admission confirmation', 'admissions_office', CURRENT_TIMESTAMP - INTERVAL '1 year'),
(2, NULL, 'ACTIVE', 'Initial enrollment completed upon admission confirmation', 'admissions_office', CURRENT_TIMESTAMP - INTERVAL '1 year'),
(3, NULL, 'ACTIVE', 'Initial enrollment', 'admissions_office', CURRENT_TIMESTAMP - INTERVAL '2 year'),
(3, 'ACTIVE', 'SUSPENDED', 'Attendance shortage in Semester 4 (< 60%)', 'dean_academics', CURRENT_TIMESTAMP - INTERVAL '1 month'),
(4, 'ACTIVE', 'GRADUATED', 'Completed degree requirements with CGPA 8.9', 'registrar_office', CURRENT_TIMESTAMP - INTERVAL '3 month'),
(5, 'GRADUATED', 'ALUMNI', 'Transitioned to official alumni directory after convocation', 'alumni_cell', CURRENT_TIMESTAMP - INTERVAL '1 year');
