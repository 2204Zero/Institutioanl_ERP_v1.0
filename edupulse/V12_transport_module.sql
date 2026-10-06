BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V12_transport_module.sql
-- Description  : Complete Fleet & Campus Transport Management System
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Vehicle
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_number VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL DEFAULT 'BUS',
    chassis_number VARCHAR(60) UNIQUE NOT NULL,
    engine_number VARCHAR(60) UNIQUE NOT NULL,
    seating_capacity INTEGER NOT NULL DEFAULT 40,
    fuel_type VARCHAR(20) NOT NULL DEFAULT 'DIESEL',
    gps_device_imei VARCHAR(50) UNIQUE,
    insurance_policy_number VARCHAR(100),
    insurance_expiry_date DATE,
    fitness_certificate_expiry DATE,
    pollution_control_expiry DATE,
    vehicle_status VARCHAR(30) NOT NULL DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_vehicle_status CHECK (vehicle_status IN ('OPERATIONAL', 'IN_SERVICE', 'REPAIR', 'DECOMMISSIONED'))
);

-- ------------------------------------------------------------------------------
-- 2. Driver
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS driver (
    driver_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    driver_license_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(25) UNIQUE NOT NULL,
    emergency_contact VARCHAR(25) NOT NULL,
    license_type VARCHAR(30) NOT NULL DEFAULT 'HEAVY_COMMERCIAL',
    license_expiry_date DATE NOT NULL,
    date_of_birth DATE NOT NULL,
    date_of_joining DATE NOT NULL,
    blood_group VARCHAR(10),
    address TEXT,
    driver_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_driver_status CHECK (driver_status IN ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'))
);

-- ------------------------------------------------------------------------------
-- 3. Route & Pickup Points
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route (
    route_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    route_code VARCHAR(30) UNIQUE NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    origin_point VARCHAR(150) NOT NULL,
    destination_point VARCHAR(150) NOT NULL,
    total_distance_km NUMERIC(6,2) NOT NULL DEFAULT 15.00,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 45,
    assigned_vehicle_id BIGINT REFERENCES vehicle(vehicle_id) ON DELETE SET NULL,
    assigned_driver_id BIGINT REFERENCES driver(driver_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pickup_point (
    pickup_point_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    route_id BIGINT NOT NULL REFERENCES route(route_id) ON DELETE CASCADE,
    stop_name VARCHAR(150) NOT NULL,
    stop_sequence INTEGER NOT NULL,
    morning_pickup_time TIME NOT NULL,
    evening_drop_time TIME NOT NULL,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    fare_amount NUMERIC(10,2) NOT NULL DEFAULT 1500.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_route_stop_sequence UNIQUE (route_id, stop_sequence)
);

-- ------------------------------------------------------------------------------
-- 4. Student Route (Transport Subscription)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_route (
    subscription_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    route_id BIGINT NOT NULL REFERENCES route(route_id) ON DELETE RESTRICT,
    pickup_point_id BIGINT NOT NULL REFERENCES pickup_point(pickup_point_id) ON DELETE RESTRICT,
    subscription_start_date DATE NOT NULL,
    subscription_end_date DATE NOT NULL,
    subscription_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    rfid_card_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_transport_sub_status CHECK (subscription_status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'))
);

-- ------------------------------------------------------------------------------
-- 5. Transport Attendance
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_attendance (
    transport_att_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES student_route(subscription_id) ON DELETE CASCADE,
    trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
    trip_direction VARCHAR(20) NOT NULL DEFAULT 'PICKUP',
    boarding_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scanner_device_id VARCHAR(50),
    is_boarded BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_trip_dir CHECK (trip_direction IN ('PICKUP', 'DROP'))
);

-- ------------------------------------------------------------------------------
-- 6. Fuel Log
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_log (
    fuel_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    driver_id BIGINT REFERENCES driver(driver_id) ON DELETE SET NULL,
    fuel_date DATE NOT NULL DEFAULT CURRENT_DATE,
    odometer_reading NUMERIC(10,2) NOT NULL,
    fuel_quantity_liters NUMERIC(8,2) NOT NULL,
    fuel_price_per_liter NUMERIC(8,2) NOT NULL,
    total_fuel_cost NUMERIC(10,2) NOT NULL,
    station_vendor_name VARCHAR(150),
    invoice_slip_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Vehicle Maintenance
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    maintenance_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    service_center VARCHAR(150) NOT NULL,
    odometer_reading NUMERIC(10,2) NOT NULL,
    service_cost NUMERIC(10,2) NOT NULL,
    parts_replaced TEXT,
    work_description TEXT NOT NULL,
    next_service_due_date DATE,
    next_service_due_odometer NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_service_cost CHECK (service_cost >= 0)
);

COMMIT;
