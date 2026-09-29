# Institutional ERP Suite — Facility & Space Reservation Engine

## 1. Space Allocation & Conflict Detection
Manages reservations for auditoriums, seminar halls, conference rooms, and sports fields.

Automated conflict checker prevents double-booking:
```typescript
export function checkSpaceConflict(newBooking: Booking, existingBookings: Booking[]): boolean {
  return existingBookings.some(b => 
    b.facilityCode === newBooking.facilityCode &&
    b.bookingDate === newBooking.bookingDate &&
    (newBooking.startTime < b.endTime && newBooking.endTime > b.startTime)
  );
}
```
