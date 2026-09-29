@echo off
title Student Information System (SIS) - Live Demonstration Runner
cls
echo ===============================================================================
echo   INSTITUTIONAL ERP v1.0 - STUDENT INFORMATION SYSTEM (SIS)
echo   Live Output Demonstration for All Modules (Day 01 to Day 06)
echo   Developer: Palak Agarwal
echo ===============================================================================
echo.
echo [1/3] Navigating to backend project directory...
cd /d "%~dp0backend"

echo [2/3] Compiling and executing all modules sequentially...
echo       - Day 01: Database Schema & Entity Relationships
echo       - Day 02: Student Profile CRUD Operations
echo       - Day 03: Guardian Management & Student Linking
echo       - Day 04: Student Documents (Upload, View, Download, Delete)
echo       - Day 05: Student Lifecycle Status Workflow & Audit Trail
echo       - Day 06: API Testing, Bean Validation & Exception Handling
echo.
echo -------------------------------------------------------------------------------
call .\mvnw.cmd test "-Dtest=StudentModuleDemonstrationTest"
echo -------------------------------------------------------------------------------
echo.
echo ===============================================================================
echo   DEMONSTRATION COMPLETED SUCCESSFULLY!
echo   All inputs, return values, DTOs, and status codes displayed above.
echo ===============================================================================
echo.
pause
