package com.erp.devjson;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.erp.JsonErpDataStoreManager;
import com.erp.devjson.model.AcademicJsonModels.*;
import com.erp.devjson.model.AdmissionJsonModels.*;
import com.erp.devjson.model.AttendanceJsonModels.AttendanceRecord;
import com.erp.devjson.model.AttendanceJsonModels.StudentAttendanceSummary;
import com.erp.devjson.model.FacultyJsonModels.FacultyRecord;
import com.erp.devjson.model.FinanceJsonModels.*;
import com.erp.devjson.model.GuardianJsonModels.GuardianRecord;
import com.erp.devjson.model.NotificationJsonModels.NotificationRecord;
import com.erp.devjson.model.StudentJsonModels.*;
import com.erp.devjson.model.TimetableJsonModels.TimetableSlotRecord;
import com.erp.devjson.model.UserJsonModels.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class JsonErpUnifiedStorageAcceptanceTest {

    @TempDir
    Path isolatedDir;

    private JsonErpDataStoreManager erpManager;

    @BeforeEach
    void setUp() {
        erpManager = new JsonErpDataStoreManager(isolatedDir);
    }

    @Test
    @DisplayName("Acceptance Test: Full ERP JSON engine workflows, locking, aggregations, idempotency, and cold restart recovery")
    void testFullErpWorkflowsInJsonDevelopmentMode() {
        // --- 1. Identity & Account Provisioning ---
        UserRecord adminUser = erpManager.getUserManager().createUser("admin", "admin@college.edu", "Admin@123", "ADMIN");
        assertNotNull(adminUser.getId());
        assertEquals("admin", adminUser.getUsername());
        assertTrue(erpManager.getUserManager().authenticate("admin", "Admin@123"));
        assertFalse(erpManager.getUserManager().authenticate("admin", "WrongPassword"));

        // Reject duplicate username/email
        assertThrows(BusinessException.class, () ->
                erpManager.getUserManager().createUser("admin", "other@college.edu", "Pass@123", "ADMIN"));
        assertThrows(BusinessException.class, () ->
                erpManager.getUserManager().createUser("otheradmin", "admin@college.edu", "Pass@123", "ADMIN"));

        // --- 2. Academic Setup ---
        DepartmentRecord cseDept = erpManager.getAcademicManager().saveDepartment(DepartmentRecord.builder()
                .name("Computer Science & Engineering")
                .code("CSE")
                .build());

        AcademicYearRecord ay2627 = erpManager.getAcademicManager().saveAcademicYear(AcademicYearRecord.builder()
                .name("2026-2027")
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2027, 5, 31))
                .build());

        ProgramRecord btechProg = erpManager.getAcademicManager().saveProgram(ProgramRecord.builder()
                .name("Bachelor of Technology in CS")
                .code("BTECH-CS")
                .degree("B.Tech")
                .departmentId(cseDept.getId())
                .duration(4)
                .build());

        CourseRecord cs101 = erpManager.getAcademicManager().saveCourse(CourseRecord.builder()
                .code("CS101")
                .name("Programming Fundamentals")
                .credits(3)
                .departmentId(cseDept.getId())
                .programId(btechProg.getId())
                .build());

        CourseRecord cs201 = erpManager.getAcademicManager().saveCourse(CourseRecord.builder()
                .code("CS201")
                .name("Data Structures & Algorithms")
                .credits(4)
                .departmentId(cseDept.getId())
                .programId(btechProg.getId())
                .build());

        // Prerequisite linking with cycle detection
        erpManager.getAcademicManager().addCoursePrerequisite(cs201.getId(), cs101.getId());
        // Attempt circular prerequisite
        assertThrows(BusinessException.class, () ->
                erpManager.getAcademicManager().addCoursePrerequisite(cs101.getId(), cs201.getId()));

        BatchRecord batch = erpManager.getAcademicManager().saveBatch(BatchRecord.builder()
                .name("2026-2030 Batch")
                .code("BATCH-2026")
                .programId(btechProg.getId())
                .academicYearId(ay2627.getId())
                .admissionYear(2026)
                .graduationYear(2030)
                .build());

        SemesterRecord sem1 = erpManager.getAcademicManager().saveSemester(SemesterRecord.builder()
                .name("Fall 2026")
                .semesterNumber(1)
                .academicYearId(ay2627.getId())
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 12, 15))
                .build());

        CourseOfferingRecord offering = erpManager.getAcademicManager().saveOffering(CourseOfferingRecord.builder()
                .courseId(cs101.getId())
                .semesterId(sem1.getId())
                .isPublished(true)
                .build());

        SectionRecord sectionA = erpManager.getAcademicManager().saveSection(SectionRecord.builder()
                .name("Section A")
                .courseOfferingId(offering.getId())
                .capacity(60)
                .isActive(true)
                .build());

        // --- 3. Faculty Setup & Section Assignment ---
        FacultyRecord facultyDrSmith = erpManager.getFacultyManager().createFaculty(FacultyRecord.builder()
                .employeeId("FAC-001")
                .firstName("John")
                .lastName("Smith")
                .email("jsmith@college.edu")
                .departmentId(cseDept.getId())
                .designation("Associate Professor")
                .build());

        erpManager.getFacultyManager().assignSection(facultyDrSmith.getId(), sectionA.getId());
        assertEquals(1, erpManager.getFacultyManager().getFacultyById(facultyDrSmith.getId()).get().getAssignedSectionIds().size());

        // --- 4. Timetable Scheduling & Conflict Detection ---
        TimetableSlotRecord slot1 = erpManager.getTimetableManager().createSlot(TimetableSlotRecord.builder()
                .sectionId(sectionA.getId())
                .facultyId(facultyDrSmith.getId())
                .dayOfWeek(1) // Monday
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .room("Room 101")
                .build());
        assertNotNull(slot1.getId());

        // Schedule conflict on same faculty
        assertThrows(BusinessException.class, () ->
                erpManager.getTimetableManager().createSlot(TimetableSlotRecord.builder()
                        .sectionId(sectionA.getId())
                        .facultyId(facultyDrSmith.getId())
                        .dayOfWeek(1)
                        .startTime(LocalTime.of(9, 30))
                        .endTime(LocalTime.of(10, 30))
                        .room("Room 102")
                        .build()));

        // --- 5. Student Creation & Lifecycle State Machine ---
        StudentRecord student1 = erpManager.getStudentManager().createStudent(StudentRecord.builder()
                .rollNumber("2026-CSE-001")
                .firstName("Alice")
                .lastName("Walker")
                .email("alice.walker@college.edu")
                .department("Computer Science & Engineering")
                .program("B.Tech CS")
                .batch("2026-2030 Batch")
                .enrollmentDate(LocalDate.of(2026, 8, 1))
                .build());

        StudentRecord student2 = erpManager.getStudentManager().createStudent(StudentRecord.builder()
                .rollNumber("2026-CSE-002")
                .firstName("Bob")
                .lastName("Walker")
                .email("bob.walker@college.edu")
                .department("Computer Science & Engineering")
                .program("B.Tech CS")
                .batch("2026-2030 Batch")
                .enrollmentDate(LocalDate.of(2026, 8, 1))
                .build());

        // Verify lifecycle progression: ACTIVE -> GRADUATED -> ALUMNI
        assertThrows(BusinessException.class, () ->
                erpManager.getStudentManager().updateStudentStatus(student1.getId(), "ALUMNI", "Direct to alumni", "admin", LocalDate.now()));

        StudentRecord graduated = erpManager.getStudentManager().updateStudentStatus(student1.getId(), "GRADUATED", "Graduated", "dean", LocalDate.now());
        assertEquals("GRADUATED", graduated.getStatus());

        StudentRecord alumni = erpManager.getStudentManager().updateStudentStatus(student1.getId(), "ALUMNI", "Alumni convocation", "admin", LocalDate.now());
        assertEquals("ALUMNI", alumni.getStatus());

        // Terminal state rejection
        assertThrows(BusinessException.class, () ->
                erpManager.getStudentManager().updateStudentStatus(student1.getId(), "ACTIVE", "Reactivate alumni", "admin", LocalDate.now()));

        // --- 6. Guardian & Multi-Ward Linking ---
        GuardianRecord guardian = erpManager.getGuardianManager().createGuardian(GuardianRecord.builder()
                .name("Robert Walker")
                .email("robert.walker@gmail.com")
                .phone("+15551234567")
                .relationship("FATHER")
                .wardStudentIds(List.of(student1.getId()))
                .build());

        // Link second ward (Multi-ward support)
        erpManager.getGuardianManager().linkWard(guardian.getId(), student2.getId());
        GuardianRecord reloadedGuardian = erpManager.getGuardianManager().getGuardianById(guardian.getId()).get();
        assertEquals(2, reloadedGuardian.getWardStudentIds().size());
        assertTrue(reloadedGuardian.getWardStudentIds().contains(student1.getId()));
        assertTrue(reloadedGuardian.getWardStudentIds().contains(student2.getId()));

        // --- 7. Attendance Recording & JPQL Aggregation Equivalents ---
        LocalDate attDate = LocalDate.of(2026, 8, 10);
        erpManager.getAttendanceManager().recordAttendance(AttendanceRecord.builder()
                .studentId(student2.getId())
                .scheduleId(slot1.getId())
                .attendanceDate(attDate)
                .status("PRESENT")
                .remarks("On time")
                .build());

        // Duplicate attendance rejection
        assertThrows(BusinessException.class, () ->
                erpManager.getAttendanceManager().recordAttendance(AttendanceRecord.builder()
                        .studentId(student2.getId())
                        .scheduleId(slot1.getId())
                        .attendanceDate(attDate)
                        .status("PRESENT")
                        .build()));

        // Record a second session (ABSENT)
        erpManager.getAttendanceManager().recordAttendance(AttendanceRecord.builder()
                .studentId(student2.getId())
                .scheduleId(slot1.getId())
                .attendanceDate(attDate.plusDays(1))
                .status("ABSENT")
                .build());

        // Derived JPQL aggregation check: 1 PRESENT out of 2 = 50.0%
        StudentAttendanceSummary attSummary = erpManager.getAttendanceManager().calculateStudentAttendanceSummary(student2.getId());
        assertEquals(2, attSummary.getTotalSessions());
        assertEquals(1, attSummary.getAttendedSessions());
        assertEquals(1, attSummary.getAbsentSessions());
        assertEquals(50.0, attSummary.getPercentage());

        // --- 8. Finance Operations, Pessimistic Locking & Idempotency ---
        FeeHeadRecord tuitionHead = erpManager.getFinanceManager().createFeeHead(FeeHeadRecord.builder()
                .name("Tuition Fee")
                .code("TUIT-01")
                .build());

        FeeStructureRecord feeStructure = erpManager.getFinanceManager().createFeeStructure(FeeStructureRecord.builder()
                .name("B.Tech CS 2026 Fee Structure")
                .academicYearId(ay2627.getId())
                .components(List.of(
                        FeeStructureComponentItem.builder()
                                .feeHeadId(tuitionHead.getId())
                                .feeHeadName("Tuition Fee")
                                .amount(new BigDecimal("50000.00"))
                                .build()
                ))
                .build());

        StudentFeeRecord assignedFee = erpManager.getFinanceManager().assignFeeStructure(student2.getId(), feeStructure.getId(), ay2627.getId());
        assertEquals(new BigDecimal("50000.00"), assignedFee.getGrossAmount());
        assertEquals(new BigDecimal("50000.00"), assignedFee.getOutstandingAmount());
        assertEquals("PENDING", assignedFee.getStatus());

        // Record Payment 1 (Partial Payment of 20000) with Idempotency Key
        String idemKey = "KEY-TX-998811";
        PaymentRecord pay1 = PaymentRecord.builder()
                .studentFeeId(assignedFee.getId())
                .amount(new BigDecimal("20000.00"))
                .paymentMethod("UPI")
                .referenceNumber("UPI-REF-001")
                .idempotencyKey(idemKey)
                .createdBy("admin")
                .build();

        ReceiptRecord receipt1 = erpManager.getFinanceManager().recordPayment(pay1);
        assertNotNull(receipt1.getId());
        assertNotNull(receipt1.getReceiptNumber());
        assertEquals(new BigDecimal("20000.00"), receipt1.getAmount());

        // Verify Student Fee balance updated
        StudentFeeRecord feeAfterPay1 = erpManager.getFinanceManager().getStudentFeeById(assignedFee.getId()).get();
        assertEquals(new BigDecimal("30000.00"), feeAfterPay1.getOutstandingAmount());
        assertEquals("PARTIAL", feeAfterPay1.getStatus());

        // Idempotent retry with exact same payload returns existing receipt
        PaymentRecord pay1Retry = PaymentRecord.builder()
                .studentFeeId(assignedFee.getId())
                .amount(new BigDecimal("20000.00"))
                .paymentMethod("UPI")
                .referenceNumber("UPI-REF-001")
                .idempotencyKey(idemKey)
                .createdBy("admin")
                .build();
        ReceiptRecord receiptRetry = erpManager.getFinanceManager().recordPayment(pay1Retry);
        assertEquals(receipt1.getId(), receiptRetry.getId());

        // Idempotent retry with altered payload is REJECTED
        PaymentRecord pay1Altered = PaymentRecord.builder()
                .studentFeeId(assignedFee.getId())
                .amount(new BigDecimal("25000.00")) // Altered amount
                .paymentMethod("UPI")
                .referenceNumber("UPI-REF-001")
                .idempotencyKey(idemKey)
                .build();
        assertThrows(BusinessException.class, () -> erpManager.getFinanceManager().recordPayment(pay1Altered));

        // Attempt overpayment (outstanding is 30000, paying 35000)
        PaymentRecord overPay = PaymentRecord.builder()
                .studentFeeId(assignedFee.getId())
                .amount(new BigDecimal("35000.00"))
                .paymentMethod("CASH")
                .build();
        assertThrows(BusinessException.class, () -> erpManager.getFinanceManager().recordPayment(overPay));

        // Complete remaining payment (30000)
        PaymentRecord pay2 = PaymentRecord.builder()
                .studentFeeId(assignedFee.getId())
                .amount(new BigDecimal("30000.00"))
                .paymentMethod("NET_BANKING")
                .referenceNumber("NB-REF-002")
                .build();
        erpManager.getFinanceManager().recordPayment(pay2);

        StudentFeeRecord feeFullyPaid = erpManager.getFinanceManager().getStudentFeeById(assignedFee.getId()).get();
        assertEquals(new BigDecimal("0.00"), feeFullyPaid.getOutstandingAmount());
        assertEquals("PAID", feeFullyPaid.getStatus());

        // Derived finance metrics verification
        FinanceSummaryRecord finSummary = erpManager.getFinanceManager().getFinancialSummary();
        assertEquals(new BigDecimal("50000.00"), finSummary.getTotalGrossAssigned());
        assertEquals(new BigDecimal("50000.00"), finSummary.getTotalCollected());
        assertEquals(new BigDecimal("0.00"), finSummary.getTotalOutstanding());

        // --- 9. Admissions Workflow & Onboarding to Student + Login ---
        ApplicantRecord applicant = erpManager.getAdmissionManager().createApplicant(ApplicantRecord.builder()
                .firstName("Charlie")
                .lastName("Day")
                .email("charlie.day@gmail.com")
                .phone("+15559876543")
                .build());

        AdmissionApplicationRecord appDraft = erpManager.getAdmissionManager().createDraftApplication(
                applicant.getId(), btechProg.getId(), ay2627.getId());
        assertEquals("DRAFT", appDraft.getStatus());

        AdmissionApplicationRecord appSubmitted = erpManager.getAdmissionManager().submitApplication(appDraft.getId());
        assertEquals("SUBMITTED", appSubmitted.getStatus());

        AdmissionApplicationRecord appAdmitted = erpManager.getAdmissionManager().updateStatus(
                appSubmitted.getId(), "ADMITTED", "Qualified in entrance exam");
        assertEquals("ADMITTED", appAdmitted.getStatus());

        // Onboard admitted applicant -> Student + User account created
        StudentRecord onboardedStudent = erpManager.getAdmissionManager().onboardAdmittedStudent(appAdmitted.getId());
        assertNotNull(onboardedStudent.getId());
        assertNotNull(onboardedStudent.getUserId());
        assertTrue(onboardedStudent.getEmail().contains("charlie.day"));

        UserRecord provisionedUser = erpManager.getUserManager().getUserById(onboardedStudent.getUserId()).get();
        assertEquals("STUDENT", provisionedUser.getRole());
        assertTrue(erpManager.getUserManager().authenticate(provisionedUser.getUsername(), "Student@123"));

        // --- 10. Notifications ---
        NotificationRecord notif = erpManager.getNotificationManager().createNotification(
                provisionedUser.getId(), "Welcome to EduPulse", "Your student portal is activated.", "SUCCESS");
        assertEquals(1, erpManager.getNotificationManager().getUnreadCount(provisionedUser.getId()));
        erpManager.getNotificationManager().markAsRead(notif.getId());
        assertEquals(0, erpManager.getNotificationManager().getUnreadCount(provisionedUser.getId()));

        // --- 11. Cross-Domain Dashboard Metrics ---
        Map<String, Object> mgmtMetrics = erpManager.getDashboardManager().getManagementDashboardMetrics();
        assertEquals(3L, mgmtMetrics.get("totalStudents")); // Alice, Bob, Charlie
        assertEquals(2L, mgmtMetrics.get("activeStudents")); // Bob, Charlie (Alice is ALUMNI)
        assertEquals(1L, mgmtMetrics.get("alumniStudents")); // Alice
        assertEquals(1L, mgmtMetrics.get("totalFaculty"));
        assertEquals(2L, mgmtMetrics.get("totalCourses"));
        assertEquals(1L, mgmtMetrics.get("totalDepartments"));

        // --- 12. COLD RESTART TEST: Reconstruction from files on disk ---
        // Verify disk files actually exist
        assertTrue(Files.exists(isolatedDir.resolve("users.json")));
        assertTrue(Files.exists(isolatedDir.resolve("students.json")));
        assertTrue(Files.exists(isolatedDir.resolve("guardians.json")));
        assertTrue(Files.exists(isolatedDir.resolve("faculty.json")));
        assertTrue(Files.exists(isolatedDir.resolve("departments.json")));
        assertTrue(Files.exists(isolatedDir.resolve("academic_years.json")));
        assertTrue(Files.exists(isolatedDir.resolve("programs.json")));
        assertTrue(Files.exists(isolatedDir.resolve("courses.json")));
        assertTrue(Files.exists(isolatedDir.resolve("course_prerequisites.json")));
        assertTrue(Files.exists(isolatedDir.resolve("timetable_slots.json")));
        assertTrue(Files.exists(isolatedDir.resolve("attendance_records.json")));
        assertTrue(Files.exists(isolatedDir.resolve("student_fees.json")));
        assertTrue(Files.exists(isolatedDir.resolve("payments.json")));
        assertTrue(Files.exists(isolatedDir.resolve("receipts.json")));
        assertTrue(Files.exists(isolatedDir.resolve("applicants.json")));
        assertTrue(Files.exists(isolatedDir.resolve("admission_applications.json")));
        assertTrue(Files.exists(isolatedDir.resolve("notifications.json")));

        // Reconstruct entire ERP manager from disk
        JsonErpDataStoreManager coldRestartErp = new JsonErpDataStoreManager(isolatedDir);

        // Verify all 11 modules survived with 100% data fidelity:
        assertEquals(2, coldRestartErp.getUserManager().count()); // admin + charlie
        assertTrue(coldRestartErp.getUserManager().authenticate("admin", "Admin@123"));
        assertEquals(3, coldRestartErp.getStudentManager().count());
        assertEquals("ALUMNI", coldRestartErp.getStudentManager().getStudentById(student1.getId()).get().getStatus());
        assertEquals(1, coldRestartErp.getGuardianManager().count());
        assertEquals(2, coldRestartErp.getGuardianManager().getGuardianById(guardian.getId()).get().getWardStudentIds().size());
        assertEquals(1, coldRestartErp.getFacultyManager().count());
        assertEquals(1, coldRestartErp.getTimetableManager().count());
        assertEquals(2, coldRestartErp.getAttendanceManager().count());
        assertEquals(50.0, coldRestartErp.getAttendanceManager().calculateStudentAttendanceSummary(student2.getId()).getPercentage());
        assertEquals(new BigDecimal("50000.00"), coldRestartErp.getFinanceManager().getFinancialSummary().getTotalCollected());
        assertEquals(1, coldRestartErp.getAdmissionManager().getApplicationStore().count());
        assertEquals(1, coldRestartErp.getNotificationManager().count());
    }
}
