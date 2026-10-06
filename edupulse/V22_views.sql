BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V22_views.sql
-- Description  : Enterprise Production Dashboard Views
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Student Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_student_dashboard AS
SELECT 
    s.student_id,
    s.enrollment_number,
    s.student_registration_number,
    s.roll_number,
    CONCAT(sp.first_name, ' ', COALESCE(sp.middle_name || ' ', ''), sp.last_name) AS full_name,
    sp.official_email,
    sp.mobile,
    p.program_code,
    p.program_name,
    d.department_name,
    s.batch_year,
    s.current_semester,
    s.enrollment_status,
    COALESCE(c.cgpa, 0.00) AS cumulative_gpa,
    COALESCE(c.total_earned_credits, 0.00) AS earned_credits,
    COALESCE(cr.total_registered_credits, 0.00) AS current_term_credits,
    ROUND(COALESCE(AVG(att.attendance_percentage), 100.00), 2) AS overall_attendance_percent,
    COALESCE(SUM(inv.net_payable_amount - inv.paid_amount), 0.00) AS outstanding_fee_balance
FROM student s
JOIN student_profile sp ON s.student_id = sp.student_id
LEFT JOIN application a ON s.application_id = a.application_id
LEFT JOIN academic_program p ON a.program_id = p.program_id
LEFT JOIN department d ON p.department_id = d.department_id
LEFT JOIN cgpa c ON s.student_id = c.student_id
LEFT JOIN course_registration cr ON s.student_id = cr.student_id AND cr.registration_status = 'COMPLETED'
LEFT JOIN attendance_summary att ON s.student_id = att.student_id
LEFT JOIN invoice inv ON s.student_id = inv.student_id AND inv.invoice_status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')
WHERE s.is_active = TRUE
GROUP BY 
    s.student_id, s.enrollment_number, s.student_registration_number, s.roll_number,
    sp.first_name, sp.middle_name, sp.last_name, sp.official_email, sp.mobile,
    p.program_code, p.program_name, d.department_name, s.batch_year, s.current_semester,
    s.enrollment_status, c.cgpa, c.total_earned_credits, cr.total_registered_credits;

-- ------------------------------------------------------------------------------
-- 2. Faculty Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_faculty_dashboard AS
SELECT 
    f.faculty_id,
    f.employee_code,
    CONCAT(f.first_name, ' ', COALESCE(f.middle_name || ' ', ''), f.last_name) AS faculty_name,
    f.official_email,
    f.mobile,
    fd.designation_name,
    d.department_name,
    f.employment_type,
    f.faculty_status,
    COUNT(DISTINCT fa.offering_id) AS active_courses_taught,
    COUNT(DISTINCT fa.section_id) AS sections_assigned,
    COALESCE(SUM(fa.assigned_workload_hours), 0.00) AS weekly_workload_hours,
    ROUND((COUNT(CASE WHEN far.attendance_status = 'PRESENT' THEN 1 END)::NUMERIC / NULLIF(COUNT(far.fac_record_id), 0)) * 100, 2) AS monthly_attendance_rate
FROM faculty f
JOIN faculty_designation fd ON f.designation_id = fd.designation_id
JOIN faculty_department fdm ON f.faculty_id = fdm.faculty_id AND fdm.is_primary_department = TRUE
JOIN department d ON fdm.department_id = d.department_id
LEFT JOIN faculty_assignment fa ON f.faculty_id = fa.faculty_id AND fa.is_active = TRUE
LEFT JOIN faculty_attendance_record far ON f.faculty_id = far.faculty_id 
    AND far.attendance_date >= (CURRENT_DATE - INTERVAL '30 days')
WHERE f.is_active = TRUE
GROUP BY 
    f.faculty_id, f.employee_code, f.first_name, f.middle_name, f.last_name,
    f.official_email, f.mobile, fd.designation_name, d.department_name,
    f.employment_type, f.faculty_status;

-- ------------------------------------------------------------------------------
-- 3. Admin Executive Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM student WHERE is_active = TRUE) AS total_enrolled_students,
    (SELECT COUNT(*) FROM student WHERE enrollment_status = 'ACTIVE' AND is_active = TRUE) AS active_students_count,
    (SELECT COUNT(*) FROM faculty WHERE faculty_status = 'ACTIVE' AND is_active = TRUE) AS active_faculty_count,
    (SELECT COUNT(*) FROM department WHERE is_active = TRUE) AS academic_departments_count,
    (SELECT COUNT(*) FROM course WHERE is_active = TRUE) AS approved_courses_catalog_count,
    (SELECT COUNT(*) FROM course_offering WHERE offering_status = 'OPEN' AND is_active = TRUE) AS active_course_offerings,
    (SELECT COUNT(*) FROM admission_inquiry WHERE inquiry_status = 'OPEN' AND is_active = TRUE) AS pending_admission_inquiries,
    (SELECT COUNT(*) FROM application WHERE application_status = 'SUBMITTED' AND is_active = TRUE) AS pending_admissions_review,
    (SELECT COUNT(*) FROM hostel_bed_allocation WHERE allocation_status = 'OCCUPIED' AND is_active = TRUE) AS hostel_residents_count,
    (SELECT COUNT(*) FROM vehicle WHERE vehicle_status = 'OPERATIONAL' AND is_active = TRUE) AS active_transport_fleet_count;

-- ------------------------------------------------------------------------------
-- 4. Finance Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_finance_dashboard AS
SELECT 
    COALESCE(SUM(net_payable_amount), 0.00) AS total_revenue_invoiced,
    COALESCE(SUM(paid_amount), 0.00) AS total_revenue_collected,
    COALESCE(SUM(net_payable_amount - paid_amount), 0.00) AS total_outstanding_dues,
    ROUND((COALESCE(SUM(paid_amount), 0.00) / NULLIF(COALESCE(SUM(net_payable_amount), 0.00), 0)) * 100, 2) AS collection_efficiency_percentage,
    COUNT(CASE WHEN invoice_status = 'PAID' THEN 1 END) AS fully_paid_invoices_count,
    COUNT(CASE WHEN invoice_status = 'OVERDUE' THEN 1 END) AS overdue_invoices_count,
    COUNT(CASE WHEN invoice_status IN ('UNPAID', 'PARTIALLY_PAID') THEN 1 END) AS pending_invoices_count,
    (SELECT COALESCE(SUM(refund_amount), 0.00) FROM refund WHERE refund_status = 'PROCESSED' AND is_active = TRUE) AS total_refunds_processed
FROM invoice
WHERE is_active = TRUE;

-- ------------------------------------------------------------------------------
-- 5. Attendance Analytics Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_attendance_dashboard AS
SELECT 
    co.offering_id,
    c.course_code,
    c.course_title,
    d.department_name,
    COUNT(DISTINCT sar.student_id) AS enrolled_students_count,
    COUNT(sar.record_id) AS total_attendance_instances_marked,
    COUNT(CASE WHEN sar.status = 'PRESENT' THEN 1 END) AS present_instances_count,
    COUNT(CASE WHEN sar.status = 'ABSENT' THEN 1 END) AS absent_instances_count,
    ROUND((COUNT(CASE WHEN sar.status = 'PRESENT' THEN 1 END)::NUMERIC / NULLIF(COUNT(sar.record_id), 0)) * 100, 2) AS course_aggregate_attendance_pct,
    COUNT(DISTINCT CASE WHEN att_sum.attendance_percentage < 75.00 THEN att_sum.student_id END) AS at_risk_debarment_student_count
FROM course_offering co
JOIN course c ON co.course_id = c.course_id
JOIN department d ON c.department_id = d.department_id
LEFT JOIN class_schedule cs ON co.offering_id = cs.offering_id
LEFT JOIN student_attendance_record sar ON cs.schedule_id = sar.schedule_id
LEFT JOIN attendance_summary att_sum ON co.offering_id = att_sum.offering_id
WHERE co.is_active = TRUE
GROUP BY co.offering_id, c.course_code, c.course_title, d.department_name;

-- ------------------------------------------------------------------------------
-- 6. Library Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_library_dashboard AS
SELECT 
    (SELECT COUNT(DISTINCT book_id) FROM book WHERE is_active = TRUE) AS total_unique_titles,
    (SELECT COUNT(*) FROM book_item WHERE is_active = TRUE) AS total_physical_inventory_copies,
    (SELECT COUNT(*) FROM book_item WHERE item_status = 'AVAILABLE' AND is_active = TRUE) AS available_copies_on_shelf,
    (SELECT COUNT(*) FROM book_item WHERE item_status = 'ISSUED' AND is_active = TRUE) AS actively_borrowed_books,
    (SELECT COUNT(*) FROM book_issue bi LEFT JOIN book_return br ON bi.issue_id = br.issue_id WHERE br.return_id IS NULL AND bi.due_date < CURRENT_DATE AND bi.is_active = TRUE) AS overdue_unreturned_loans,
    (SELECT COALESCE(SUM(fine_amount), 0.00) FROM library_fine WHERE is_paid = FALSE AND is_active = TRUE) AS total_pending_overdue_fines;

-- ------------------------------------------------------------------------------
-- 7. Exam & Results Dashboard View
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_exam_dashboard AS
SELECT 
    e.exam_id,
    e.exam_code,
    e.exam_title,
    c.course_code,
    c.course_title,
    et.type_name AS exam_type_name,
    e.exam_date,
    e.max_marks,
    e.passing_marks,
    COUNT(m.marks_id) AS total_appeared_candidates,
    COUNT(CASE WHEN m.is_absent = TRUE THEN 1 END) AS absent_candidates_count,
    ROUND(AVG(m.final_marks), 2) AS average_score_obtained,
    MAX(m.final_marks) AS highest_score_achieved,
    MIN(m.final_marks) AS lowest_score_achieved,
    COUNT(CASE WHEN m.final_marks >= e.passing_marks THEN 1 END) AS passed_candidates_count,
    ROUND((COUNT(CASE WHEN m.final_marks >= e.passing_marks THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN m.is_absent = FALSE THEN 1 END), 0)) * 100, 2) AS pass_percentage
FROM exam e
JOIN course_offering co ON e.offering_id = co.offering_id
JOIN course c ON co.course_id = c.course_id
JOIN exam_type et ON e.exam_type_id = et.exam_type_id
LEFT JOIN marks m ON e.exam_id = m.exam_id
WHERE e.is_active = TRUE
GROUP BY 
    e.exam_id, e.exam_code, e.exam_title, c.course_code, c.course_title,
    et.type_name, e.exam_date, e.max_marks, e.passing_marks;

COMMIT;
