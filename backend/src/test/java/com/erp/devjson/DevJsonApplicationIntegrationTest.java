package com.erp.devjson;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.attendance.dto.AttendanceRecordRequest;
import com.erp.attendance.dto.AttendanceResponse;
import com.erp.attendance.service.AttendanceService;
import com.erp.auth.entity.AppUser;
import com.erp.auth.repository.UserRepository;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.sync.DevJsonSyncEngine;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.finance.dto.FinanceSummaryResponseDto;
import com.erp.finance.dto.PaymentRequestDto;
import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.service.FinanceReportService;
import com.erp.finance.service.PaymentService;
import com.erp.finance.service.StudentFeeService;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.dto.GuardianResponseDto;
import com.erp.guardian.service.GuardianService;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import com.erp.student.service.StudentIdentityService;
import com.erp.student.service.StudentOnboardingService;
import com.erp.student.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-json")
@TestPropertySource(properties = {
        "erp.devjson.enabled=true"
})
public class DevJsonApplicationIntegrationTest {

    @Autowired
    private DevJsonProperties devJsonProperties;

    @Autowired
    private DevJsonSyncEngine syncEngine;

    @Autowired
    private StudentOnboardingService onboardingService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentIdentityService studentIdentityService;

    @Autowired
    private GuardianService guardianService;

    @Autowired
    private StudentFeeService studentFeeService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FinanceReportService financeReportService;

    @Autowired
    private AttendanceService attendanceService;

    // Repositories for baseline fixture setup
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private AcademicYearRepository academicYearRepository;
    @Autowired private ProgramRepository programRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private CourseOfferingRepository offeringRepository;
    @Autowired private SectionRepository sectionRepository;
    @Autowired private SectionStudentRepository sectionStudentRepository;
    @Autowired private BatchRepository batchRepository;
    @Autowired private SemesterRepository semesterRepository;
    @Autowired private TimetableSlotRepository timetableSlotRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private FeeHeadRepository feeHeadRepository;
    @Autowired private FeeStructureRepository feeStructureRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private AdmissionApplicationRepository applicationRepository;

    @BeforeEach
    void setupSecurity() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("superadmin", "N/A",
                        List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"), new SimpleGrantedAuthority("ROLE_ADMIN")))
        );
    }

    @Test
    @DisplayName("Dev-JSON Integration: Verify real application services write to JSON files and preserve consistency")
    void testRealServicesWriteToDevJsonFiles() {
        Path storageDir = devJsonProperties.getStoragePath();
        assertNotNull(storageDir);

        // 1. Setup Academic Foundations
        Department dept = new Department();
        dept.setName("Computer Science & Engineering");
        dept.setCode("CSE_INT_" + System.currentTimeMillis());
        dept = departmentRepository.save(dept);

        AcademicYear ay = new AcademicYear();
        ay.setName("AY-" + System.currentTimeMillis());
        ay.setStartDate(LocalDate.of(2026, 8, 1));
        ay.setEndDate(LocalDate.of(2027, 5, 31));
        ay.setIsActive(true);
        ay = academicYearRepository.save(ay);

        Program prog = new Program();
        prog.setName("B.Tech CSE");
        prog.setCode("PROG_" + System.currentTimeMillis());
        prog.setDegree("B.Tech");
        prog.setDepartmentId(dept.getId());
        prog.setDuration(4);
        prog.setIsActive(true);
        prog = programRepository.save(prog);

        Batch batch = new Batch();
        batch.setName("Batch 2026");
        batch.setCode("B26_" + System.currentTimeMillis());
        batch.setProgramId(prog.getId());
        batch.setAcademicYearId(ay.getId());
        batch.setAdmissionYear(2026);
        batch.setGraduationYear(2030);
        batch.setIsActive(true);
        batchRepository.save(batch);

        Semester sem = new Semester();
        sem.setName("Semester 1");
        sem.setSemesterNumber(1);
        sem.setAcademicYearId(ay.getId());
        sem.setStartDate(LocalDate.of(2026, 8, 1));
        sem.setEndDate(LocalDate.of(2026, 12, 15));
        sem.setIsActive(true);
        semesterRepository.save(sem);

        Course course = new Course();
        course.setCode("CS_INT_" + System.currentTimeMillis());
        course.setName("Object Oriented Programming");
        course.setCredits(3);
        course.setDepartmentId(dept.getId());
        course.setProgramId(prog.getId());
        course.setCourseType("THEORY");
        course.setIsActive(true);
        course = courseRepository.save(course);

        CourseOffering offering = CourseOffering.builder()
                .course(course)
                .semester(sem)
                .maxCapacity(60)
                .isPublished(true)
                .build();
        offering = offeringRepository.save(offering);

        Section section = Section.builder()
                .name("Section 1")
                .courseOffering(offering)
                .capacity(50)
                .isActive(true)
                .build();
        section = sectionRepository.save(section);

        // 2. Admin Enrollment Provisions Student Account
        Applicant applicant = Applicant.builder()
                .firstName("David")
                .lastName("Miller")
                .email("david.miller." + System.currentTimeMillis() + "@test.com")
                .phone("+1555" + (System.currentTimeMillis() % 10000000))
                .dateOfBirth(LocalDate.of(2004, 3, 15))
                .gender("MALE")
                .build();
        applicant = applicantRepository.save(applicant);

        AdmissionApplication app = AdmissionApplication.builder()
                .applicationNumber("APP-INT-" + System.currentTimeMillis())
                .applicant(applicant)
                .program(prog)
                .academicYear(ay)
                .status(ApplicationStatus.ADMITTED)
                .build();
        app = applicationRepository.save(app);

        // Execute real onboarding service
        Student enrolledStudent = onboardingService.onboardStudent(app.getId());
        assertNotNull(enrolledStudent.getId());
        assertNotNull(enrolledStudent.getUserId());
        assertEquals(StudentStatus.ACTIVE, enrolledStudent.getStatus());

        // Verify JSON file write for students and users
        assertTrue(Files.exists(storageDir.resolve("students.json")));
        assertTrue(Files.exists(storageDir.resolve("users.json")));
        assertTrue(syncEngine.getStudentStore().existsById(enrolledStudent.getId()));
        assertTrue(syncEngine.getUserStore().existsById(enrolledStudent.getUserId()));

        // 3. Student Identity Resolution
        Student resolvedStudent = studentIdentityService.getStudentForEmail(enrolledStudent.getEmail());
        assertEquals(enrolledStudent.getId(), resolvedStudent.getId());

        // 4. Guardian Linking & Multi-Ward
        GuardianRequestDto guardianDto = new GuardianRequestDto();
        guardianDto.setFirstName("Sarah");
        guardianDto.setLastName("Miller");
        guardianDto.setRelation("MOTHER");
        guardianDto.setPhone("+1555" + (System.currentTimeMillis() % 10000000 + 1));
        guardianDto.setEmail("sarah.miller." + System.currentTimeMillis() + "@test.com");
        guardianDto.setOccupation("Engineer");
        guardianDto.setAddress("123 Elm St");
        guardianDto.setIsEmergencyContact(true);
        guardianDto.setStudentId(enrolledStudent.getId());

        GuardianResponseDto savedGuardian = guardianService.createGuardian(guardianDto);
        assertNotNull(savedGuardian.getId());
        assertTrue(Files.exists(storageDir.resolve("guardians.json")));

        // 5. Student Lifecycle Transition & Audit History
        StudentStatusUpdateDto statusUpdate = new StudentStatusUpdateDto(
                StudentStatus.GRADUATED,
                "Curriculum finished with Honors",
                "superadmin",
                LocalDate.now()
        );
        var updatedDto = studentService.updateStudentStatus(enrolledStudent.getId(), statusUpdate);
        assertEquals(StudentStatus.GRADUATED, updatedDto.getStatus());

        StudentStatusUpdateDto alumniUpdate = new StudentStatusUpdateDto(
                StudentStatus.ALUMNI,
                "Enrolled in Alumni network",
                "superadmin",
                LocalDate.now()
        );
        var alumniDto = studentService.updateStudentStatus(enrolledStudent.getId(), alumniUpdate);
        assertEquals(StudentStatus.ALUMNI, alumniDto.getStatus());
        assertTrue(Files.exists(storageDir.resolve("student_status_history.json")));

        // 6. Finance: Fee Assignment & Payment with Idempotency
        FeeHead feeHead = new FeeHead();
        feeHead.setName("Laboratory Fee");
        feeHead.setCode("LAB_" + System.currentTimeMillis());
        feeHead = feeHeadRepository.save(feeHead);

        FeeStructure fs = new FeeStructure();
        fs.setName("Lab Structure 2026");
        fs.setCode("FS_" + System.currentTimeMillis());
        fs.setAcademicYearId(ay.getId());
        fs.setActive(true);

        FeeStructureComponent fsc = new FeeStructureComponent();
        fsc.setFeeStructure(fs);
        fsc.setFeeHead(feeHead);
        fsc.setAmount(new BigDecimal("15000.00"));
        fs.getComponents().add(fsc);
        fs = feeStructureRepository.save(fs);

        StudentFee assignedFee = studentFeeService.assignFeeStructure(enrolledStudent.getId(), fs.getId(), ay.getId());
        assertNotNull(assignedFee.getId());
        assertEquals(new BigDecimal("15000.00"), assignedFee.getOutstandingAmount());
        assertTrue(Files.exists(storageDir.resolve("student_fees.json")));

        // Record Payment via PaymentService
        String idemKey = "IDEM-INT-" + System.currentTimeMillis();
        PaymentRequestDto payReq = new PaymentRequestDto();
        payReq.setAmount(new BigDecimal("15000.00"));
        payReq.setPaymentDate(LocalDate.now());
        payReq.setPaymentMethod(PaymentMethod.CARD);
        payReq.setReferenceNumber("CARD-TX-" + System.currentTimeMillis());
        payReq.setRemarks("Full fee payment");
        payReq.setIdempotencyKey(idemKey);

        Receipt receipt = paymentService.recordPayment(payReq, assignedFee.getId());
        assertNotNull(receipt.getId());
        assertNotNull(receipt.getReceiptNumber());
        assertTrue(Files.exists(storageDir.resolve("payments.json")));
        assertTrue(Files.exists(storageDir.resolve("receipts.json")));

        // 7. Finance Report Summary Verification
        FinanceSummaryResponseDto finSummary = financeReportService.getFinancialSummaryDto();
        assertNotNull(finSummary);
        assertTrue(finSummary.getTotalCollected().compareTo(BigDecimal.ZERO) > 0);

        // 8. Timetable & Attendance Workflow
        Faculty faculty = Faculty.builder()
                .firstName("Robert")
                .lastName("Davis")
                .officialEmail("rdavis." + System.currentTimeMillis() + "@test.com")
                .departmentId(dept.getId())
                .isActive(true)
                .build();
        faculty = facultyRepository.save(faculty);

        TimetableSlot slot = TimetableSlot.builder()
                .sectionId(section.getId())
                .facultyId(faculty.getId())
                .roomId(101L)
                .dayOfWeek(DayOfWeek.TUESDAY)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .isActive(true)
                .build();
        slot = timetableSlotRepository.save(slot);

        // Link student to section roster for attendance validation
        com.erp.academic.section.entity.SectionStudent ss = com.erp.academic.section.entity.SectionStudent.builder()
                .sectionId(section.getId())
                .studentId(enrolledStudent.getId())
                .isActive(true)
                .build();
        sectionStudentRepository.save(ss);

        // Record attendance
        attendanceService.recordAttendance(
                new AttendanceRecordRequest(enrolledStudent.getId(), course.getCode(), "PRESENT", "Present in class", LocalDate.now(), slot.getId()),
                "admin"
        );
        assertTrue(Files.exists(storageDir.resolve("attendance_records.json")));

        List<AttendanceResponse> attList = attendanceService.getAttendanceByStudent(enrolledStudent.getId());
        assertFalse(attList.isEmpty());
        assertEquals("PRESENT", attList.get(0).status());
    }
}
