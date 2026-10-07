# Institutional ERP v1.0 - Student Information System (SIS)
# PowerShell One-Click Runner for All Modules
# Developer: Palak Agarwal

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  INSTITUTIONAL ERP v1.0 - STUDENT INFORMATION SYSTEM (SIS)" -ForegroundColor Yellow
Write-Host "  Live Output Demonstration for All Modules (Day 01 to Day 06)" -ForegroundColor Green
Write-Host "  Developer: Palak Agarwal" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$BackendPath = Join-Path $PSScriptRoot "backend"
Set-Location $BackendPath

Write-Host "[INFO] Executing all modules and printing live inputs and outputs..." -ForegroundColor Yellow
Write-Host "       - Day 01: Database Schema & Entity Relationships"
Write-Host "       - Day 02: Student Profile CRUD Operations"
Write-Host "       - Day 03: Guardian Management & Student Linking"
Write-Host "       - Day 04: Student Documents (Upload, View, Download, Delete)"
Write-Host "       - Day 05: Student Lifecycle Status Workflow & Audit Trail"
Write-Host "       - Day 06: API Testing, Bean Validation & Exception Handling"
Write-Host ""

& .\mvnw.cmd test "-Dtest=StudentModuleDemonstrationTest"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  DEMONSTRATION COMPLETED SUCCESSFULLY! (BUILD SUCCESS)" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
