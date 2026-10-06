BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V23_functions.sql
-- Description  : Enterprise Stored Procedures, Functions & Financial Algorithms
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Function: Generate Unique Student Registration Number
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_generate_student_id(
    p_batch_year INTEGER,
    p_program_code VARCHAR
)
RETURNS VARCHAR AS $$
DECLARE
    v_seq_num BIGINT;
    v_clean_prog VARCHAR(10);
    v_student_id VARCHAR(50);
BEGIN
    SELECT COUNT(*) + 1 INTO v_seq_num
    FROM student
    WHERE batch_year = p_batch_year;

    v_clean_prog := UPPER(SUBSTRING(REPLACE(p_program_code, '-', '') FROM 1 FOR 6));
    v_student_id := 'EP-' || p_batch_year || '-' || v_clean_prog || '-' || LPAD(v_seq_num::TEXT, 4, '0');
    
    RETURN v_student_id;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Helper Function: Generate Receipt Number
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_generate_receipt_number()
RETURNS VARCHAR AS $$
DECLARE
    v_today_str VARCHAR(8);
    v_count BIGINT;
    v_receipt_no VARCHAR(60);
BEGIN
    v_today_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO v_count
    FROM receipt
    WHERE DATE(receipt_date) = CURRENT_DATE;

    v_receipt_no := 'RCPT-' || v_today_str || '-' || LPAD(v_count::TEXT, 5, '0');
    RETURN v_receipt_no;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. Helper Function: Generate Invoice Number
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    v_today_str VARCHAR(8);
    v_count BIGINT;
    v_invoice_no VARCHAR(60);
BEGIN
    v_today_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COUNT(*) + 1 INTO v_count
    FROM invoice
    WHERE issue_date = CURRENT_DATE;

    v_invoice_no := 'INV-' || v_today_str || '-' || LPAD(v_count::TEXT, 5, '0');
    RETURN v_invoice_no;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. Calculate Student Attendance Percentage for a Course Offering
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_attendance_percentage(
    p_student_id BIGINT,
    p_offering_id BIGINT
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_classes INTEGER := 0;
    v_attended_classes INTEGER := 0;
    v_percentage NUMERIC(5,2) := 100.00;
BEGIN
    SELECT 
        COUNT(sar.record_id),
        COUNT(CASE WHEN sar.status = 'PRESENT' THEN 1 END)
    INTO v_total_classes, v_attended_classes
    FROM student_attendance_record sar
    JOIN class_schedule cs ON sar.schedule_id = cs.schedule_id
    WHERE sar.student_id = p_student_id 
      AND cs.offering_id = p_offering_id
      AND sar.is_active = TRUE;

    IF v_total_classes > 0 THEN
        v_percentage := ROUND((v_attended_classes::NUMERIC / v_total_classes::NUMERIC) * 100.0, 2);
    END IF;

    RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 5. Calculate Semester GPA (SGPA)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_semester_gpa(
    p_student_id BIGINT,
    p_semester_id BIGINT
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_credits NUMERIC(6,2) := 0.00;
    v_total_points NUMERIC(8,2) := 0.00;
    v_sgpa NUMERIC(4,2) := 0.00;
BEGIN
    SELECT 
        COALESCE(SUM(c.credits), 0.00),
        COALESCE(SUM(r.grade_point * c.credits), 0.00)
    INTO v_total_credits, v_total_points
    FROM result r
    JOIN course_offering co ON r.offering_id = co.offering_id
    JOIN course c ON co.course_id = c.course_id
    WHERE r.student_id = p_student_id
      AND r.semester_id = p_semester_id
      AND r.is_active = TRUE;

    IF v_total_credits > 0 THEN
        v_sgpa := ROUND(v_total_points / v_total_credits, 2);
    END IF;

    RETURN v_sgpa;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 6. Calculate Cumulative Grade Point Average (CGPA)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_cumulative_cgpa(
    p_student_id BIGINT
)
RETURNS NUMERIC AS $$
DECLARE
    v_total_credits NUMERIC(6,2) := 0.00;
    v_total_points NUMERIC(8,2) := 0.00;
    v_cgpa NUMERIC(4,2) := 0.00;
BEGIN
    SELECT 
        COALESCE(SUM(c.credits), 0.00),
        COALESCE(SUM(r.grade_point * c.credits), 0.00)
    INTO v_total_credits, v_total_points
    FROM result r
    JOIN course_offering co ON r.offering_id = co.offering_id
    JOIN course c ON co.course_id = c.course_id
    WHERE r.student_id = p_student_id
      AND r.is_active = TRUE;

    IF v_total_credits > 0 THEN
        v_cgpa := ROUND(v_total_points / v_total_credits, 2);
    END IF;

    RETURN v_cgpa;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 7. Stored Procedure: Student Admission Enrollment
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_enroll_student(
    IN p_application_id BIGINT,
    IN p_batch_year INTEGER,
    IN p_roll_number VARCHAR,
    OUT p_student_id BIGINT
)
AS $$
DECLARE
    v_app_status VARCHAR(30);
    v_program_code VARCHAR(30);
    v_reg_number VARCHAR(50);
    v_enroll_number VARCHAR(50);
BEGIN
    SELECT a.application_status, ap.program_code
    INTO v_app_status, v_program_code
    FROM application a
    JOIN academic_program ap ON a.program_id = ap.program_id
    WHERE a.application_id = p_application_id;

    IF v_app_status IS NULL THEN
        RAISE EXCEPTION 'Application ID % not found.', p_application_id;
    END IF;

    v_reg_number := fn_generate_student_id(p_batch_year, v_program_code);
    v_enroll_number := 'EN' || p_batch_year || LPAD(p_application_id::TEXT, 5, '0');

    INSERT INTO student (
        application_id, student_registration_number, enrollment_number, roll_number,
        admission_date, batch_year, current_semester, enrollment_status
    ) VALUES (
        p_application_id, v_reg_number, v_enroll_number, p_roll_number,
        CURRENT_DATE, p_batch_year, 1, 'ACTIVE'
    ) RETURNING student_id INTO p_student_id;

    UPDATE application
    SET application_status = 'ENROLLED', updated_at = CURRENT_TIMESTAMP
    WHERE application_id = p_application_id;

    INSERT INTO student_history (student_id, event_type, from_status, to_status, action_by, remarks)
    VALUES (p_student_id, 'ENROLLMENT', 'APPLIED', 'ACTIVE', 'ADMISSION_OFFICER', 'Successfully converted from application to enrolled student.');
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 8. Stored Procedure: Generate Student Fee Invoice
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_generate_invoice(
    IN p_student_id BIGINT,
    IN p_structure_id BIGINT,
    IN p_due_date DATE,
    OUT p_invoice_id BIGINT
)
AS $$
DECLARE
    v_total_fee NUMERIC(12,2);
    v_invoice_num VARCHAR(60);
BEGIN
    SELECT total_amount INTO v_total_fee
    FROM fee_structure
    WHERE structure_id = p_structure_id;

    IF v_total_fee IS NULL THEN
        RAISE EXCEPTION 'Fee structure ID % does not exist.', p_structure_id;
    END IF;

    v_invoice_num := fn_generate_invoice_number();

    INSERT INTO invoice (
        student_id, structure_id, invoice_number, issue_date, due_date,
        total_due_amount, net_payable_amount, paid_amount, invoice_status
    ) VALUES (
        p_student_id, p_structure_id, v_invoice_num, CURRENT_DATE, p_due_date,
        v_total_fee, v_total_fee, 0.00, 'UNPAID'
    ) RETURNING invoice_id INTO p_invoice_id;

    INSERT INTO ledger (student_id, entry_type, amount, running_balance, reference_type, reference_id, description)
    VALUES (p_student_id, 'DEBIT', v_total_fee, v_total_fee, 'INVOICE', v_invoice_num, 'Invoice generated for tuition fee.');
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 9. Stored Procedure: Student Semester Promotion
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_promote_student(
    IN p_student_id BIGINT,
    OUT p_promoted_semester INTEGER,
    OUT p_status VARCHAR
)
AS $$
DECLARE
    v_curr_sem INTEGER;
    v_cgpa NUMERIC(4,2);
BEGIN
    SELECT current_semester INTO v_curr_sem
    FROM student
    WHERE student_id = p_student_id AND is_active = TRUE;

    IF v_curr_sem IS NULL THEN
        RAISE EXCEPTION 'Active student ID % not found.', p_student_id;
    END IF;

    v_cgpa := fn_calculate_cumulative_cgpa(p_student_id);

    IF v_cgpa >= 2.00 THEN
        p_promoted_semester := v_curr_sem + 1;
        p_status := 'PROMOTED';

        UPDATE student
        SET current_semester = p_promoted_semester, updated_at = CURRENT_TIMESTAMP
        WHERE student_id = p_student_id;

        INSERT INTO student_history (student_id, event_type, from_status, to_status, action_by, remarks)
        VALUES (p_student_id, 'SEMESTER_PROMOTION', 'SEM_' || v_curr_sem, 'SEM_' || p_promoted_semester, 'REGISTRAR', 'Promoted based on satisfactory CGPA: ' || v_cgpa);
    ELSE
        p_promoted_semester := v_curr_sem;
        p_status := 'ACADEMIC_PROBATION';

        INSERT INTO student_history (student_id, event_type, from_status, to_status, action_by, remarks)
        VALUES (p_student_id, 'PROBATION_FLAG', 'SEM_' || v_curr_sem, 'PROBATION', 'ACADEMIC_COUNCIL', 'Under probation due to low CGPA: ' || v_cgpa);
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;
