# Institutional ERP Suite — Automated Timetable & Conflict Resolution Engine

## 1. Executive Summary & Algorithmic Design
The Timetable & Scheduling Engine (`src/pages/TimetablePage.tsx`) provides high-density schedule generation, faculty workload allocation, and real-time collision detection across classrooms, laboratories, and faculty members.

It resolves hard and soft constraints to prevent double-booking of rooms, overlapping faculty slots, or excessive consecutive teaching hours.

---

## 2. Constraint Resolution Architecture

### 2.1 Hard Constraints (Zero Tolerance)
1. **Room Overlap**: No two class sections can occupy the same room at the exact same day/time slot.
2. **Faculty Overlap**: No faculty member can teach two classes simultaneously.
3. **Student Group Conflict**: A cohort/section (e.g., CSE 5th Sem Sec A) cannot have overlapping lectures.

### 2.2 Soft Constraints (Optimization Objectives)
1. Even distribution of lectures throughout the week (no 8-hour single day load).
2. Minimization of faculty gap hours between sessions.
3. Laboratory slots grouped into 2 or 3 consecutive hourly blocks.

---

## 3. Data Schema Definitions

```typescript
export interface TimeSlot {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string; // '09:00'
  endTime: string;   // '10:00'
  periodIndex: number; // 1 to 8
}

export interface TimetableEntry {
  id: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  facultyId: string;
  roomNumber: string;
  building: string;
  section: string; // 'CS-5A'
  day: TimeSlot['dayOfWeek'];
  startTime: string;
  endTime: string;
  isLab: boolean;
}
```

---

## 4. Conflict Detection Algorithm (Frontend & Backend Integration)

### 4.1 Collision Checking Matrix
```typescript
export function checkScheduleConflict(
  newEntry: TimetableEntry,
  existingEntries: TimetableEntry[]
): { hasConflict: boolean; reason?: string } {
  for (const entry of existingEntries) {
    if (entry.day === newEntry.day && entry.startTime === newEntry.startTime) {
      if (entry.roomNumber === newEntry.roomNumber) {
        return { hasConflict: true, reason: `Room ${newEntry.roomNumber} is already occupied by ${entry.courseCode}.` };
      }
      if (entry.facultyId === newEntry.facultyId) {
        return { hasConflict: true, reason: `Faculty ${entry.facultyName} is already assigned to ${entry.courseCode}.` };
      }
      if (entry.section === newEntry.section) {
        return { hasConflict: true, reason: `Section ${newEntry.section} already has ${entry.courseCode} scheduled.` };
      }
    }
  }
  return { hasConflict: false };
}
```

---

## 5. UI Capabilities & Visual Grid
- **Interactive Day Grid**: Rendered dynamically using Tailwind CSS grids (`grid-cols-6 gap-3`).
- **Conflict Highlights**: Overlapping or unassigned slots marked in `bg-amber-500/10 border-amber-500/30`.
- **Export & Sync**: Supports PDF matrix generation and iCal feed exports for faculty calendars.
