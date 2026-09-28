# Institutional ERP Suite — Student Attendance Tracking & Eligibility Engine

## 1. System Vision & Regulatory Compliance
The Attendance System (`src/pages/AttendancePage.tsx`) captures student presence across theory classes, laboratory sessions, and institutional events.

It automatically computes attendance percentages, enforces university eligibility rules (e.g., 75% mandatory threshold for appearing in semester end examinations), and triggers automated SMS/email warnings to guardians when attendance drops below mandated thresholds.

---

## 2. Multi-Mode Attendance Capture Architecture

The platform supports 4 modes of attendance marking:
1. **Faculty Manual Marker**: Rapid single-tap / bulk toggle UI designed for mobile and desktop screens.
2. **Biometric Integration**: Real-time webhook ingestion from RFID readers, fingerprint scanners, or facial recognition hardware at classroom entry gates.
3. **Dynamic QR Code Check-in**: Faculty projects time-expiring (15-second rotating) QR codes; students scan via mobile app with geotagging validation.
4. **LMS Live Class Automated Attendance**: Presence logged automatically based on duration spent in interactive webinars.

---

## 3. Mandatory 75% Eligibility Rule Engine

### 3.1 Eligibility Formula
$$\text{Attendance \%} = \left( \frac{\text{Classes Attended} + \text{Duty Leaves Approved}}{\text{Total Conducted Classes}} \right) \times 100$$

### 3.2 Medical & Duty Leave (OD) Waiver Workflow
```
[ Student Submits OD / Medical Application ]
                    │
                    ▼
      [ Head of Dept (HOD) Approval ]
                    │
                    ▼
[ Approved Hours Added as Duty Leave Credits ] ──> [ Re-calculated Attendance Eligibility ]
```

---

## 4. Data Models (TypeScript Interfaces)

```typescript
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'DUTY_LEAVE' | 'MEDICAL_LEAVE';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  courseId: string;
  section: string;
  date: string; // '2026-09-28'
  timeSlotId: string;
  status: AttendanceStatus;
  markedByFacultyId: string;
  timestamp: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  courseId: string;
  totalConducted: number;
  totalAttended: number;
  totalDutyLeaves: number;
  percentage: number;
  isEligibleForExam: boolean; // percentage >= 75.0
}
```

---

## 5. Security & Audit Integrity
- **Locking Window**: Attendance records lock 48 hours post-session. Edits past the window require Dean approval with mandatory justification log.
- **Audit Logging**: Every attendance submission writes to Spring Boot stdout:
  ```json
  {"actor":"FAC-8012","action":"SUBMITTED_ATTENDANCE","course":"CS-501","presentCount":45,"absentCount":3,"timestamp":"2026-09-28T14:00:00Z"}
  ```
