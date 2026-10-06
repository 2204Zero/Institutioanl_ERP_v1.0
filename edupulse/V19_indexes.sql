BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V19_indexes.sql
-- Description  : Enterprise Database Performance Indexing Engine
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Admission & Core Foundation Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_calendar_dates ON academic_calendar(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_status ON academic_calendar(is_current_term, is_active);

CREATE INDEX IF NOT EXISTS idx_inquiry_email ON admission_inquiry(email);
CREATE INDEX IF NOT EXISTS idx_inquiry_mobile ON admission_inquiry(mobile);
CREATE INDEX IF NOT EXISTS idx_inquiry_status ON admission_inquiry(inquiry_status);
CREATE INDEX IF NOT EXISTS idx_inquiry_date ON admission_inquiry(inquiry_date);

CREATE INDEX IF NOT EXISTS idx_applicant_email ON applicant(email);
CREATE INDEX IF NOT EXISTS idx_applicant_mobile ON applicant(mobile);
CREATE INDEX IF NOT EXISTS idx_applicant_inquiry_fk ON applicant(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_applicant_status ON applicant(registration_status);

CREATE INDEX IF NOT EXISTS idx_application_applicant_fk ON application(applicant_id);
CREATE INDEX IF NOT EXISTS idx_application_program_fk ON application(program_id);
CREATE INDEX IF NOT EXISTS idx_application_calendar_fk ON application(calendar_id);
CREATE INDEX IF NOT EXISTS idx_application_status ON application(application_status);
CREATE INDEX IF NOT EXISTS idx_application_date ON application(submission_date);

CREATE INDEX IF NOT EXISTS idx_app_doc_app_fk ON application_document(application_id);
CREATE INDEX IF NOT EXISTS idx_app_doc_status ON application_document(verification_status);

CREATE INDEX IF NOT EXISTS idx_app_review_app_fk ON application_review(application_id);
CREATE INDEX IF NOT EXISTS idx_app_review_rec ON application_review(review_recommendation);

CREATE INDEX IF NOT EXISTS idx_admission_decision_app_fk ON admission_decision(application_id);
CREATE INDEX IF NOT EXISTS idx_admission_decision_type ON admission_decision(decision_type);

CREATE INDEX IF NOT EXISTS idx_student_app_fk ON student(application_id);
CREATE INDEX IF NOT EXISTS idx_student_reg_no ON student(student_registration_number);
CREATE INDEX IF NOT EXISTS idx_student_enroll_no ON student(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_student_roll_no ON student(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_batch_status ON student(batch_year, enrollment_status);
CREATE INDEX IF NOT EXISTS idx_student_active ON student(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_student_history_student_fk ON student_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_history_date ON student_history(event_date);

-- ------------------------------------------------------------------------------
-- 2. Student Module Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_student_profile_student_fk ON student_profile(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profile_email ON student_profile(official_email);
CREATE INDEX IF NOT EXISTS idx_student_profile_mobile ON student_profile(mobile);
CREATE INDEX IF NOT EXISTS idx_student_profile_name ON student_profile(last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_student_guardian_student_fk ON student_guardian(student_id);
CREATE INDEX IF NOT EXISTS idx_student_guardian_guardian_fk ON student_guardian(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_phone ON guardian(primary_mobile);

CREATE INDEX IF NOT EXISTS idx_student_address_student_fk ON student_address(student_id);
CREATE INDEX IF NOT EXISTS idx_student_address_postal ON student_address(postal_code);

CREATE INDEX IF NOT EXISTS idx_emergency_contact_student_fk ON emergency_contact(student_id);
CREATE INDEX IF NOT EXISTS idx_prev_education_student_fk ON previous_education(student_id);
CREATE INDEX IF NOT EXISTS idx_med_record_student_fk ON medical_record(student_id);

CREATE INDEX IF NOT EXISTS idx_student_scholarship_student_fk ON student_scholarship(student_id);
CREATE INDEX IF NOT EXISTS idx_student_scholarship_scholar_fk ON student_scholarship(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_student_scholarship_status ON student_scholarship(scholarship_status);

CREATE INDEX IF NOT EXISTS idx_student_doc_student_fk ON student_document(student_id);
CREATE INDEX IF NOT EXISTS idx_student_doc_cat ON student_document(document_category);

CREATE INDEX IF NOT EXISTS idx_student_status_student_fk ON student_status(student_id);
CREATE INDEX IF NOT EXISTS idx_student_login_student_fk ON student_login(student_id);
CREATE INDEX IF NOT EXISTS idx_student_login_user ON student_login(username);

-- ------------------------------------------------------------------------------
-- 3. Academic Module Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_academic_prog_dept_fk ON academic_program(department_id);
CREATE INDEX IF NOT EXISTS idx_batch_prog_fk ON batch(program_id);
CREATE INDEX IF NOT EXISTS idx_batch_years ON batch(admission_year, graduation_year);

CREATE INDEX IF NOT EXISTS idx_semester_cal_fk ON semester(calendar_id);
CREATE INDEX IF NOT EXISTS idx_semester_dates ON semester(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_course_dept_fk ON course(department_id);
CREATE INDEX IF NOT EXISTS idx_course_cat_fk ON course(category_id);
CREATE INDEX IF NOT EXISTS idx_course_code ON course(course_code);

CREATE INDEX IF NOT EXISTS idx_course_prereq_course_fk ON course_prerequisite(course_id);
CREATE INDEX IF NOT EXISTS idx_course_prereq_target_fk ON course_prerequisite(prerequisite_course_id);

CREATE INDEX IF NOT EXISTS idx_curriculum_prog_fk ON curriculum(program_id);
CREATE INDEX IF NOT EXISTS idx_credit_map_curriculum_fk ON credit_mapping(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_credit_map_course_fk ON credit_mapping(course_id);

CREATE INDEX IF NOT EXISTS idx_course_offering_course_fk ON course_offering(course_id);
CREATE INDEX IF NOT EXISTS idx_course_offering_sem_fk ON course_offering(semester_id);
CREATE INDEX IF NOT EXISTS idx_course_offering_status ON course_offering(offering_status);

CREATE INDEX IF NOT EXISTS idx_section_offering_fk ON section(offering_id);

-- ------------------------------------------------------------------------------
-- 4. Faculty Module Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_faculty_desig_fk ON faculty(designation_id);
CREATE INDEX IF NOT EXISTS idx_faculty_emp_code ON faculty(employee_code);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(official_email);
CREATE INDEX IF NOT EXISTS idx_faculty_mobile ON faculty(mobile);
CREATE INDEX IF NOT EXISTS idx_faculty_status ON faculty(faculty_status);

CREATE INDEX IF NOT EXISTS idx_fac_dept_faculty_fk ON faculty_department(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_dept_dept_fk ON faculty_department(department_id);

CREATE INDEX IF NOT EXISTS idx_fac_qual_faculty_fk ON faculty_qualification(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_doc_faculty_fk ON faculty_documents(faculty_id);

CREATE INDEX IF NOT EXISTS idx_fac_assign_faculty_fk ON faculty_assignment(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_assign_offering_fk ON faculty_assignment(offering_id);
CREATE INDEX IF NOT EXISTS idx_fac_assign_section_fk ON faculty_assignment(section_id);

CREATE INDEX IF NOT EXISTS idx_fac_att_faculty_fk ON faculty_attendance(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_att_date_status ON faculty_attendance(attendance_date, attendance_status);

CREATE INDEX IF NOT EXISTS idx_fac_salary_faculty_fk ON faculty_salary(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_login_faculty_fk ON faculty_login(faculty_id);

-- ------------------------------------------------------------------------------
-- 5. Course Registration Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_student_reg_hold_student_fk ON student_registration_hold(student_id);
CREATE INDEX IF NOT EXISTS idx_student_reg_hold_hold_fk ON student_registration_hold(hold_id);
CREATE INDEX IF NOT EXISTS idx_student_reg_hold_active ON student_registration_hold(is_hold_active) WHERE is_hold_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_course_reg_student_fk ON course_registration(student_id);
CREATE INDEX IF NOT EXISTS idx_course_reg_sem_fk ON course_registration(semester_id);
CREATE INDEX IF NOT EXISTS idx_course_reg_status ON course_registration(registration_status);

CREATE INDEX IF NOT EXISTS idx_reg_item_reg_fk ON registration_item(registration_id);
CREATE INDEX IF NOT EXISTS idx_reg_item_offering_fk ON registration_item(offering_id);
CREATE INDEX IF NOT EXISTS idx_reg_item_section_fk ON registration_item(section_id);
CREATE INDEX IF NOT EXISTS idx_reg_item_status ON registration_item(item_status);

CREATE INDEX IF NOT EXISTS idx_reg_approval_reg_fk ON registration_approval(registration_id);
CREATE INDEX IF NOT EXISTS idx_reg_approval_faculty_fk ON registration_approval(advisor_faculty_id);

CREATE INDEX IF NOT EXISTS idx_reg_payment_reg_fk ON registration_payment(registration_id);
CREATE INDEX IF NOT EXISTS idx_reg_payment_status ON registration_payment(payment_status);

CREATE INDEX IF NOT EXISTS idx_drop_course_item_fk ON drop_course(registration_item_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_course_item_fk ON withdraw_course(registration_item_id);

-- ------------------------------------------------------------------------------
-- 6. Timetable & Schedule Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_room_building_fk ON room(building_id);
CREATE INDEX IF NOT EXISTS idx_room_type_fk ON room(room_type_id);
CREATE INDEX IF NOT EXISTS idx_room_number ON room(room_number);

CREATE INDEX IF NOT EXISTS idx_time_slot_day_time ON time_slot(day_of_week, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_class_sched_offering_fk ON class_schedule(offering_id);
CREATE INDEX IF NOT EXISTS idx_class_sched_section_fk ON class_schedule(section_id);
CREATE INDEX IF NOT EXISTS idx_class_sched_slot_fk ON class_schedule(time_slot_id);

CREATE INDEX IF NOT EXISTS idx_fac_alloc_sched_fk ON faculty_allocation(schedule_id);
CREATE INDEX IF NOT EXISTS idx_fac_alloc_fac_fk ON faculty_allocation(faculty_id);

CREATE INDEX IF NOT EXISTS idx_class_alloc_sched_fk ON classroom_allocation(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_alloc_room_fk ON classroom_allocation(room_id);

-- ------------------------------------------------------------------------------
-- 7. Attendance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_biometric_log_device_fk ON biometric_raw_log(device_id);
CREATE INDEX IF NOT EXISTS idx_biometric_log_punch ON biometric_raw_log(punch_timestamp, is_processed);

CREATE INDEX IF NOT EXISTS idx_student_att_student_fk ON student_attendance_record(student_id);
CREATE INDEX IF NOT EXISTS idx_student_att_sched_fk ON student_attendance_record(schedule_id);
CREATE INDEX IF NOT EXISTS idx_student_att_composite ON student_attendance_record(attendance_date, status);

CREATE INDEX IF NOT EXISTS idx_fac_att_rec_fac_fk ON faculty_attendance_record(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fac_att_rec_date ON faculty_attendance_record(attendance_date);

CREATE INDEX IF NOT EXISTS idx_att_corr_student_fk ON attendance_correction(student_id);
CREATE INDEX IF NOT EXISTS idx_att_corr_record_fk ON attendance_correction(record_id);

CREATE INDEX IF NOT EXISTS idx_leave_student_fk ON leave_request(applicant_student_id) WHERE applicant_student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leave_faculty_fk ON leave_request(applicant_faculty_id) WHERE applicant_faculty_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_request(start_date, end_date, approval_status);

CREATE INDEX IF NOT EXISTS idx_att_summary_composite ON attendance_summary(student_id, offering_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_att_alert_composite ON attendance_alert(student_id, offering_id, alert_level);

-- ------------------------------------------------------------------------------
-- 8. Exam & Grading Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exam_offering_fk ON exam(offering_id);
CREATE INDEX IF NOT EXISTS idx_exam_type_fk ON exam(exam_type_id);
CREATE INDEX IF NOT EXISTS idx_exam_date ON exam(exam_date, exam_status);

CREATE INDEX IF NOT EXISTS idx_exam_hall_exam_fk ON exam_hall(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_hall_room_fk ON exam_hall(room_id);

CREATE INDEX IF NOT EXISTS idx_invig_exam_fk ON invigilator(exam_id);
CREATE INDEX IF NOT EXISTS idx_invig_faculty_fk ON invigilator(faculty_id);

CREATE INDEX IF NOT EXISTS idx_marks_exam_fk ON marks(exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_fk ON marks(student_id);

CREATE INDEX IF NOT EXISTS idx_result_student_fk ON result(student_id);
CREATE INDEX IF NOT EXISTS idx_result_offering_fk ON result(offering_id);
CREATE INDEX IF NOT EXISTS idx_result_sem_fk ON result(semester_id);
CREATE INDEX IF NOT EXISTS idx_result_grade ON result(grade_letter, is_passed);

CREATE INDEX IF NOT EXISTS idx_sgpa_composite ON student_semester_gpa(student_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_cgpa_student_fk ON cgpa(student_id);
CREATE INDEX IF NOT EXISTS idx_transcript_student_fk ON transcript(student_id);
CREATE INDEX IF NOT EXISTS idx_transcript_serial ON transcript(transcript_serial);

-- ------------------------------------------------------------------------------
-- 9. Finance & Ledger Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fee_struct_prog_fk ON fee_structure(program_id);
CREATE INDEX IF NOT EXISTS idx_fee_item_struct_fk ON fee_structure_item(structure_id);
CREATE INDEX IF NOT EXISTS idx_fee_item_cat_fk ON fee_structure_item(category_id);

CREATE INDEX IF NOT EXISTS idx_invoice_student_fk ON invoice(student_id);
CREATE INDEX IF NOT EXISTS idx_invoice_status_due ON invoice(invoice_status, due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoice(invoice_number);

CREATE INDEX IF NOT EXISTS idx_payment_invoice_fk ON payment(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_student_fk ON payment(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_ref ON payment(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payment_timestamp ON payment(payment_timestamp, payment_status);

CREATE INDEX IF NOT EXISTS idx_receipt_payment_fk ON receipt(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipt_number ON receipt(receipt_number);

CREATE INDEX IF NOT EXISTS idx_fine_student_fk ON fine(student_id);
CREATE INDEX IF NOT EXISTS idx_fine_paid ON fine(is_paid, is_waived);

CREATE INDEX IF NOT EXISTS idx_refund_payment_fk ON refund(payment_id);
CREATE INDEX IF NOT EXISTS idx_refund_student_fk ON refund(student_id);

CREATE INDEX IF NOT EXISTS idx_ledger_student_timestamp ON ledger(student_id, entry_timestamp);
CREATE INDEX IF NOT EXISTS idx_ledger_ref ON ledger(reference_type, reference_id);

-- ------------------------------------------------------------------------------
-- 10. Library Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_book_cat_fk ON book(category_id);
CREATE INDEX IF NOT EXISTS idx_book_pub_fk ON book(publisher_id);
CREATE INDEX IF NOT EXISTS idx_book_isbn ON book(isbn);
CREATE INDEX IF NOT EXISTS idx_book_title ON book(title);

CREATE INDEX IF NOT EXISTS idx_book_item_book_fk ON book_item(book_id);
CREATE INDEX IF NOT EXISTS idx_book_item_rack_fk ON book_item(rack_id);
CREATE INDEX IF NOT EXISTS idx_book_item_barcode ON book_item(barcode);
CREATE INDEX IF NOT EXISTS idx_book_item_status ON book_item(item_status);

CREATE INDEX IF NOT EXISTS idx_book_issue_item_fk ON book_issue(item_id);
CREATE INDEX IF NOT EXISTS idx_book_issue_student_fk ON book_issue(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_book_issue_faculty_fk ON book_issue(faculty_id) WHERE faculty_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_book_issue_dates ON book_issue(issue_date, due_date);

CREATE INDEX IF NOT EXISTS idx_book_return_issue_fk ON book_return(issue_id);
CREATE INDEX IF NOT EXISTS idx_book_res_book_fk ON book_reservation(book_id);
CREATE INDEX IF NOT EXISTS idx_lib_fine_issue_fk ON library_fine(issue_id);

-- ------------------------------------------------------------------------------
-- 11. Hostel, Transport & HR Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_hostel_room_hostel_fk ON hostel_room(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_bed_room_fk ON hostel_bed(room_id);
CREATE INDEX IF NOT EXISTS idx_bed_alloc_bed_fk ON hostel_bed_allocation(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_alloc_student_fk ON hostel_bed_allocation(student_id);
CREATE INDEX IF NOT EXISTS idx_bed_alloc_status ON hostel_bed_allocation(allocation_status);

CREATE INDEX IF NOT EXISTS idx_mess_hostel_fk ON hostel_mess(hostel_id);
CREATE INDEX IF NOT EXISTS idx_mess_sub_student_fk ON hostel_mess_subscription(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_complaint_student_fk ON hostel_complaint(student_id);

CREATE INDEX IF NOT EXISTS idx_pickup_route_fk ON pickup_point(route_id);
CREATE INDEX IF NOT EXISTS idx_student_route_student_fk ON student_route(student_id);
CREATE INDEX IF NOT EXISTS idx_student_route_route_fk ON student_route(route_id);
CREATE INDEX IF NOT EXISTS idx_fuel_log_vehicle_fk ON fuel_log(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maint_vehicle_fk ON vehicle_maintenance(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_emp_dept_fk ON employee(hr_dept_id);
CREATE INDEX IF NOT EXISTS idx_emp_email ON employee(official_email);
CREATE INDEX IF NOT EXISTS idx_emp_mobile ON employee(mobile);
CREATE INDEX IF NOT EXISTS idx_emp_code ON employee(employee_code);

CREATE INDEX IF NOT EXISTS idx_payroll_emp_fk ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(pay_period_year, pay_period_month);

-- ------------------------------------------------------------------------------
-- 12. Inventory, Notification & Document Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_stock_store_fk ON stock(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_item_fk ON stock(item_id);
CREATE INDEX IF NOT EXISTS idx_po_vendor_fk ON purchase(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_num ON purchase(po_number);

CREATE INDEX IF NOT EXISTS idx_notif_queue_status_sched ON notification_queue(queue_status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notification(recipient_user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_doc_folder_fk ON document(folder_id);
CREATE INDEX IF NOT EXISTS idx_doc_uuid ON document(document_uuid);
CREATE INDEX IF NOT EXISTS idx_doc_version_fk ON document_version(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_perm_doc_fk ON document_permission(document_id);

-- ------------------------------------------------------------------------------
-- 13. Security Module & GIN JSONB Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_app_user_username ON app_user(username);
CREATE INDEX IF NOT EXISTS idx_app_user_email ON app_user(email);
CREATE INDEX IF NOT EXISTS idx_app_user_phone ON app_user(phone_number);
CREATE INDEX IF NOT EXISTS idx_app_user_type_status ON app_user(user_type, user_status);

CREATE INDEX IF NOT EXISTS idx_user_role_user_fk ON user_role(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_role_fk ON user_role(role_id);
CREATE INDEX IF NOT EXISTS idx_role_perm_role_fk ON role_permission(role_id);
CREATE INDEX IF NOT EXISTS idx_role_perm_perm_fk ON role_permission(permission_id);

CREATE INDEX IF NOT EXISTS idx_login_history_user_fk ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_timestamp ON login_history(login_timestamp);

CREATE INDEX IF NOT EXISTS idx_refresh_token_user_fk ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_session_token ON session_table(session_token);
CREATE INDEX IF NOT EXISTS idx_session_user_fk ON session_table(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_table_op ON audit_logs(table_name, operation_type);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(performed_at);

-- GIN Indexes on JSONB payloads
CREATE INDEX IF NOT EXISTS idx_audit_new_data_gin ON audit_logs USING GIN (new_data);
CREATE INDEX IF NOT EXISTS idx_notif_payload_gin ON notification_queue USING GIN (payload_json);
CREATE INDEX IF NOT EXISTS idx_app_dashboard_layout_gin ON analytics_dashboard USING GIN (grid_layout_json);

COMMIT;
