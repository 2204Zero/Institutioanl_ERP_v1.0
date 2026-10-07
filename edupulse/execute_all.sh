#!/bin/bash

# EduPulse ERP Database Initialization Script
# This script ensures the SQL files are executed in the correct chronological order, 
# preventing "relation does not exist" errors that happen when sorting alphabetically (e.g. V10 executing before V2).

export PGPASSWORD="postgres"
DB_USER="postgres"
DB_NAME="edupulse_db"
DB_HOST="localhost"
DB_PORT="5432"

echo "Executing EduPulse ERP Database Initialization..."

echo "Running V1_create_core_database.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V1_create_core_database.sql

echo "Running V2_student_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V2_student_module.sql

echo "Running V3_academic_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V3_academic_module.sql

echo "Running V4_faculty_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V4_faculty_module.sql

echo "Running V5_registration_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V5_registration_module.sql

echo "Running V6_timetable_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V6_timetable_module.sql

echo "Running V7_attendance_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V7_attendance_module.sql

echo "Running V8_exam_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V8_exam_module.sql

echo "Running V9_finance_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V9_finance_module.sql

echo "Running V10_library_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V10_library_module.sql

echo "Running V11_hostel_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V11_hostel_module.sql

echo "Running V12_transport_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V12_transport_module.sql

echo "Running V13_hr_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V13_hr_module.sql

echo "Running V14_inventory_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V14_inventory_module.sql

echo "Running V15_notification_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V15_notification_module.sql

echo "Running V16_document_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V16_document_module.sql

echo "Running V17_analytics_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V17_analytics_module.sql

echo "Running V18_security_module.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V18_security_module.sql

echo "Running V19_indexes.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V19_indexes.sql

echo "Running V20_seed_data.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V20_seed_data.sql

echo "Running V21_testing.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V21_testing.sql

echo "Running V22_views.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V22_views.sql

echo "Running V23_functions.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V23_functions.sql

echo "Running V24_triggers.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V24_triggers.sql

echo "Running V25_backup_restore.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V25_backup_restore.sql

echo "Running V26_cleanup.sql..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f V26_cleanup.sql

echo "EduPulse ERP Database Initialization Complete!"
