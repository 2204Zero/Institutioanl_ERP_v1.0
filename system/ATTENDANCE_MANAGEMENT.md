# Institutional ERP Suite — Biometric, RFID & Geo-fenced HR Attendance System

## 1. Multi-Device Ingestion Architecture
- **Biometric Gate Readers**: Real-time push webhooks from fingerprint/facial recognition gates.
- **RFID Pass Scanning**: Turnstile punch logging.
- **Geo-fenced Mobile Punching**: Latitude/longitude bounds validation for field/research staff.

---

## 2. Shift & Work Hours Rule Engine
- **Standard Working Hours**: 8 hours/day.
- **Late Grace Period**: Up to 15 minutes post shift start time.
- **Overtime Accrual**: Logged when daily duty duration exceeds 8.5 hours.
