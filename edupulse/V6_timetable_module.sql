BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V6_timetable_module.sql
-- Description  : Infrastructure, Scheduling, Timetables, Room & Faculty Allocations
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Building
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS building (
    building_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building_code VARCHAR(30) UNIQUE NOT NULL,
    building_name VARCHAR(150) NOT NULL,
    campus_zone VARCHAR(100) NOT NULL DEFAULT 'MAIN_CAMPUS',
    total_floors INTEGER NOT NULL DEFAULT 4,
    has_elevator BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Room Type
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_type (
    room_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_code VARCHAR(30) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    is_laboratory BOOLEAN NOT NULL DEFAULT FALSE,
    is_lecture_hall BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. Room
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room (
    room_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building_id BIGINT NOT NULL REFERENCES building(building_id) ON DELETE RESTRICT,
    room_type_id BIGINT NOT NULL REFERENCES room_type(room_type_id) ON DELETE RESTRICT,
    room_number VARCHAR(30) NOT NULL,
    floor_number INTEGER NOT NULL DEFAULT 1,
    seating_capacity INTEGER NOT NULL DEFAULT 60,
    exam_capacity INTEGER NOT NULL DEFAULT 30,
    has_projector BOOLEAN NOT NULL DEFAULT TRUE,
    has_air_conditioning BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_building_room UNIQUE (building_id, room_number),
    CONSTRAINT chk_room_capacity CHECK (seating_capacity > 0 AND exam_capacity > 0)
);

-- ------------------------------------------------------------------------------
-- 4. Time Slot
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS time_slot (
    time_slot_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slot_code VARCHAR(30) UNIQUE NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type VARCHAR(30) NOT NULL DEFAULT 'LECTURE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_day_of_week CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    CONSTRAINT chk_time_window CHECK (end_time > start_time)
);

-- ------------------------------------------------------------------------------
-- 5. Working Day
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS working_day (
    working_day_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    calendar_id BIGINT NOT NULL REFERENCES academic_calendar(calendar_id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL,
    is_working_day BOOLEAN NOT NULL DEFAULT TRUE,
    standard_working_hours NUMERIC(4,2) DEFAULT 8.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_calendar_working_day UNIQUE (calendar_id, day_of_week)
);

-- ------------------------------------------------------------------------------
-- 6. Holiday
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS holiday (
    holiday_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    calendar_id BIGINT NOT NULL REFERENCES academic_calendar(calendar_id) ON DELETE CASCADE,
    holiday_name VARCHAR(150) NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_type VARCHAR(50) NOT NULL DEFAULT 'NATIONAL',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_calendar_holiday_date UNIQUE (calendar_id, holiday_date)
);

-- ------------------------------------------------------------------------------
-- 7. Class Schedule
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_schedule (
    schedule_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE CASCADE,
    section_id BIGINT REFERENCES section(section_id) ON DELETE CASCADE,
    time_slot_id BIGINT NOT NULL REFERENCES time_slot(time_slot_id) ON DELETE RESTRICT,
    schedule_code VARCHAR(60) UNIQUE NOT NULL,
    effective_start_date DATE NOT NULL,
    effective_end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 8. Faculty Allocation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_allocation (
    allocation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES class_schedule(schedule_id) ON DELETE CASCADE,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    is_lead_faculty BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_schedule_faculty UNIQUE (schedule_id, faculty_id)
);

-- ------------------------------------------------------------------------------
-- 9. Classroom Allocation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classroom_allocation (
    classroom_alloc_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES class_schedule(schedule_id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES room(room_id) ON DELETE RESTRICT,
    allocation_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_schedule_room UNIQUE (schedule_id, room_id),
    CONSTRAINT chk_alloc_status CHECK (allocation_status IN ('CONFIRMED', 'TENTATIVE', 'RESCHEDULED', 'CANCELLED'))
);

COMMIT;
