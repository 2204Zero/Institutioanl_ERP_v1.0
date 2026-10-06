BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V24_triggers.sql
-- Description  : Enterprise Automated Triggers, Audits, Financial Reconciliations & Life-cycle Hooks
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Universal updated_at Timestamp Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE OR REPLACE TRIGGER trg_student_updated_at
BEFORE UPDATE ON student
FOR EACH ROW EXECUTE FUNCTION fn_trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_faculty_updated_at
BEFORE UPDATE ON faculty
FOR EACH ROW EXECUTE FUNCTION fn_trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_course_reg_updated_at
BEFORE UPDATE ON course_registration
FOR EACH ROW EXECUTE FUNCTION fn_trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_invoice_updated_at
BEFORE UPDATE ON invoice
FOR EACH ROW EXECUTE FUNCTION fn_trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_payment_updated_at
BEFORE UPDATE ON payment
FOR EACH ROW EXECUTE FUNCTION fn_trigger_set_updated_at();

CREATE OR REPLACE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW EXECUTE FUNCTION fn_trigger_set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Audit Trail Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_audit_log_capture()
RETURNS TRIGGER AS $$
DECLARE
    v_record_id VARCHAR(100);
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.user_id::TEXT;
        v_old_data := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.user_id::TEXT;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.user_id::TEXT;
        v_new_data := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (
        table_name, operation_type, record_id, old_data, new_data, performed_by_username
    ) VALUES (
        TG_TABLE_NAME, TG_OP, v_record_id, v_old_data, v_new_data, CURRENT_USER
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_audit_app_user
AFTER INSERT OR UPDATE OR DELETE ON app_user
FOR EACH ROW EXECUTE FUNCTION fn_trigger_audit_log_capture();

-- ------------------------------------------------------------------------------
-- 3. Soft Delete Enforcement Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Hard delete prohibited on table %. Use soft-delete (deleted_at, is_active=false).', TG_TABLE_NAME;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_prevent_hard_delete_student
BEFORE DELETE ON student
FOR EACH ROW EXECUTE FUNCTION fn_trigger_prevent_hard_delete();

CREATE OR REPLACE TRIGGER trg_prevent_hard_delete_faculty
BEFORE DELETE ON faculty
FOR EACH ROW EXECUTE FUNCTION fn_trigger_prevent_hard_delete();

-- ------------------------------------------------------------------------------
-- 4. Financial Reconciliation Trigger (Auto Invoice Balance & Ledger)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_payment_reconciliation()
RETURNS TRIGGER AS $$
DECLARE
    v_new_paid NUMERIC(12,2);
    v_net_payable NUMERIC(12,2);
    v_inv_status VARCHAR(30);
BEGIN
    IF (NEW.payment_status = 'SUCCESS') THEN
        SELECT paid_amount + NEW.payment_amount, net_payable_amount
        INTO v_new_paid, v_net_payable
        FROM invoice
        WHERE invoice_id = NEW.invoice_id;

        IF v_new_paid >= v_net_payable THEN
            v_inv_status := 'PAID';
        ELSE
            v_inv_status := 'PARTIALLY_PAID';
        END IF;

        UPDATE invoice
        SET paid_amount = v_new_paid,
            invoice_status = v_inv_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE invoice_id = NEW.invoice_id;

        INSERT INTO ledger (
            student_id, entry_type, amount, running_balance,
            reference_type, reference_id, description
        ) VALUES (
            NEW.student_id, 'CREDIT', NEW.payment_amount,
            (v_net_payable - v_new_paid), 'PAYMENT',
            NEW.transaction_reference, 'Payment credited via ' || NEW.payment_mode
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_payment_reconciliation
AFTER INSERT ON payment
FOR EACH ROW EXECUTE FUNCTION fn_trigger_payment_reconciliation();

-- ------------------------------------------------------------------------------
-- 5. Attendance Summary Auto-Aggregation Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_update_attendance_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_offering_id BIGINT;
    v_semester_id BIGINT;
    v_total INTEGER;
    v_attended INTEGER;
    v_pct NUMERIC(5,2);
BEGIN
    SELECT cs.offering_id, co.semester_id
    INTO v_offering_id, v_semester_id
    FROM class_schedule cs
    JOIN course_offering co ON cs.offering_id = co.offering_id
    WHERE cs.schedule_id = NEW.schedule_id;

    SELECT 
        COUNT(sar.record_id),
        COUNT(CASE WHEN sar.status = 'PRESENT' THEN 1 END)
    INTO v_total, v_attended
    FROM student_attendance_record sar
    JOIN class_schedule cs ON sar.schedule_id = cs.schedule_id
    WHERE sar.student_id = NEW.student_id 
      AND cs.offering_id = v_offering_id;

    v_pct := ROUND((v_attended::NUMERIC / NULLIF(v_total, 0)::NUMERIC) * 100.0, 2);

    INSERT INTO attendance_summary (
        student_id, offering_id, semester_id,
        total_delivered_classes, total_attended_classes, attendance_percentage
    ) VALUES (
        NEW.student_id, v_offering_id, v_semester_id,
        v_total, v_attended, v_pct
    )
    ON CONFLICT (student_id, offering_id, semester_id)
    DO UPDATE SET
        total_delivered_classes = EXCLUDED.total_delivered_classes,
        total_attended_classes = EXCLUDED.total_attended_classes,
        attendance_percentage = EXCLUDED.attendance_percentage,
        last_calculated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_attendance_summary
AFTER INSERT OR UPDATE ON student_attendance_record
FOR EACH ROW EXECUTE FUNCTION fn_trigger_update_attendance_summary();

-- ------------------------------------------------------------------------------
-- 6. Course Registration Total Credit Auto-Recalculation Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_recalculate_registered_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_reg_id BIGINT;
    v_sum_credits NUMERIC(5,2);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_reg_id := OLD.registration_id;
    ELSE
        v_reg_id := NEW.registration_id;
    END IF;

    SELECT COALESCE(SUM(credits), 0.00) INTO v_sum_credits
    FROM registration_item
    WHERE registration_id = v_reg_id AND item_status = 'ENROLLED';

    UPDATE course_registration
    SET total_registered_credits = v_sum_credits, updated_at = CURRENT_TIMESTAMP
    WHERE registration_id = v_reg_id;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_recalculate_reg_credits
AFTER INSERT OR UPDATE OR DELETE ON registration_item
FOR EACH ROW EXECUTE FUNCTION fn_trigger_recalculate_registered_credits();

-- ------------------------------------------------------------------------------
-- 7. Automated Notification on New Invoice Generation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_notify_on_invoice()
RETURNS TRIGGER AS $$
DECLARE
    v_email VARCHAR(150);
BEGIN
    SELECT official_email INTO v_email
    FROM student_profile
    WHERE student_id = NEW.student_id;

    IF v_email IS NOT NULL THEN
        INSERT INTO notification_queue (
            channel, recipient_identifier, payload_json, priority, scheduled_for
        ) VALUES (
            'EMAIL', v_email,
            json_build_object('invoice_number', NEW.invoice_number, 'amount', NEW.net_payable_amount, 'due_date', NEW.due_date),
            'NORMAL', CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_on_invoice
AFTER INSERT ON invoice
FOR EACH ROW EXECUTE FUNCTION fn_trigger_notify_on_invoice();

-- ------------------------------------------------------------------------------
-- 8. Automated Student Status History Tracker
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_trigger_track_student_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.enrollment_status IS DISTINCT FROM NEW.enrollment_status) THEN
        INSERT INTO student_history (
            student_id, event_type, from_status, to_status, action_by, remarks
        ) VALUES (
            NEW.student_id, 'STATUS_CHANGE', OLD.enrollment_status, NEW.enrollment_status,
            COALESCE(NEW.updated_by, 'SYSTEM'), 'Automated enrollment status modification triggered.'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_track_student_history
AFTER UPDATE OF enrollment_status ON student
FOR EACH ROW EXECUTE FUNCTION fn_trigger_track_student_history();

COMMIT;
