package com.erp.auth;

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
import com.erp.academic.section.dto.SectionFacultyAssignRequest;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionFacultyRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.admin.controller.AdminFacultyController;
import com.erp.attendance.dto.AttendanceRecordEntry;
import com.erp.attendance.dto.BulkAttendanceRequest;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev-json")
@TestPropertySource(properties = {
        "erp.devjson.enabled=true"
})
public class RoleWorkspacesAndAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseOfferingRepository courseOfferingRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SectionStudentRepository sectionStudentRepository;

    @Autowired
    private SectionFacultyRepository sectionFacultyRepository;

    @Autowired
    private TimetableSlotRepository timetableSlotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DevJsonProperties devJsonProperties;

    private String loginAndGetToken(String username, String password, String role) throws Exception {
        LoginRequest req = new LoginRequest(username, password, role);
        MvcResult res = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).path("accessToken").asText();
    }

    private Department testDept;
    private AcademicYear testAy;
    private Program testProg;
    private Batch testBatch;
    private Semester testSem;
    private Course testCourse;
    private CourseOffering testOffering;
    private Section assignedSection;
    private Section unassignedSection;
    private TimetableSlot testSlot;
    private Student testStudent1;
    private Student testStudent2;

    @BeforeEach
    void setupFixtures() {
        testDept = departmentRepository.findAll().stream().findFirst().orElseGet(() -> {
            Department d = new Department();
            d.setName("Engineering Dept");
            d.setCode("ENG_DEPT");
            return departmentRepository.save(d);
        });

        testAy = academicYearRepository.findAll().stream().findFirst().orElseGet(() -> {
            AcademicYear ay = new AcademicYear();
            ay.setName("AY 2026-2027");
            ay.setStartDate(LocalDate.of(2026, 8, 1));
            ay.setEndDate(LocalDate.of(2027, 5, 31));
            ay.setIsActive(true);
            return academicYearRepository.save(ay);
        });

        testProg = programRepository.findAll().stream().findFirst().orElseGet(() -> {
            Program p = new Program();
            p.setName("Computer Science & Engineering");
            p.setCode("CSE-PROG");
            p.setDepartmentId(testDept.getId());
            p.setIsActive(true);
            return programRepository.save(p);
        });

        testBatch = batchRepository.findAll().stream().findFirst().orElseGet(() -> {
            Batch b = new Batch();
            b.setName("Batch 2026-2030");
            b.setCode("B26_30");
            b.setProgramId(testProg.getId());
            b.setAcademicYearId(testAy.getId());
            b.setAdmissionYear(2026);
            b.setGraduationYear(2030);
            b.setIsActive(true);
            return batchRepository.save(b);
        });

        testSem = semesterRepository.findAll().stream().findFirst().orElseGet(() -> {
            Semester s = new Semester();
            s.setName("Semester 1");
            s.setAcademicYearId(testAy.getId());
            s.setSemesterNumber(1);
            s.setStartDate(LocalDate.of(2026, 8, 1));
            s.setEndDate(LocalDate.of(2026, 12, 15));
            s.setIsActive(true);
            return semesterRepository.save(s);
        });

        testCourse = courseRepository.findAll().stream().findFirst().orElseGet(() -> {
            Course c = new Course();
            c.setName("Programming Paradigms");
            c.setCode("CS-701");
            c.setCredits(4);
            c.setDepartmentId(testDept.getId());
            c.setProgramId(testProg.getId());
            c.setIsActive(true);
            return courseRepository.save(c);
        });

        testOffering = courseOfferingRepository.findAll().stream().findFirst().orElseGet(() -> {
            CourseOffering co = CourseOffering.builder()
                    .course(testCourse)
                    .semester(testSem)
                    .maxCapacity(60)
                    .isPublished(true)
                    .build();
            return courseOfferingRepository.save(co);
        });

        // Create Section A (assigned to faculty)
        List<Section> existingSections = sectionRepository.findByCourseOfferingId(testOffering.getId());
        assignedSection = existingSections.stream()
                .filter(s -> "Section A - Workspaces".equals(s.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Section s = Section.builder()
                            .name("Section A - Workspaces")
                            .courseOffering(testOffering)
                            .capacity(60)
                            .isActive(true)
                            .build();
                    return sectionRepository.save(s);
                });

        // Create Section B (unassigned to faculty)
        unassignedSection = existingSections.stream()
                .filter(s -> "Section B - Workspaces".equals(s.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Section s = Section.builder()
                            .name("Section B - Workspaces")
                            .courseOffering(testOffering)
                            .capacity(60)
                            .isActive(true)
                            .build();
                    return sectionRepository.save(s);
                });

        // Ensure Students
        testStudent1 = studentRepository.findByRollNumber("ROLL-WS-001").orElseGet(() -> {
            Student s = new Student();
            s.setRollNumber("ROLL-WS-001");
            s.setFirstName("Alice");
            s.setLastName("Wonderland");
            s.setEmail("alice.ws@institutional.edu");
            s.setPhone("+919988776601");
            s.setDateOfBirth(LocalDate.of(2005, 1, 1));
            s.setGender("FEMALE");
            s.setDepartment("Engineering");
            s.setBatch("Batch 2026-2030");
            s.setEnrollmentDate(LocalDate.now());
            s.setStatus(StudentStatus.ACTIVE);
            return studentRepository.save(s);
        });

        testStudent2 = studentRepository.findByRollNumber("ROLL-WS-002").orElseGet(() -> {
            Student s = new Student();
            s.setRollNumber("ROLL-WS-002");
            s.setFirstName("Bob");
            s.setLastName("Builder");
            s.setEmail("bob.ws@institutional.edu");
            s.setPhone("+919988776602");
            s.setDateOfBirth(LocalDate.of(2005, 2, 2));
            s.setGender("MALE");
            s.setDepartment("Engineering");
            s.setBatch("Batch 2026-2030");
            s.setEnrollmentDate(LocalDate.now());
            s.setStatus(StudentStatus.ACTIVE);
            return studentRepository.save(s);
        });

        // Enroll Student 1 into assigned Section A
        if (!sectionStudentRepository.existsBySectionIdAndStudentId(assignedSection.getId(), testStudent1.getId())) {
            com.erp.academic.section.entity.SectionStudent ss = new com.erp.academic.section.entity.SectionStudent();
            ss.setSectionId(assignedSection.getId());
            ss.setStudentId(testStudent1.getId());
            ss.setIsActive(true);
            sectionStudentRepository.save(ss);
        }

        // Setup TimetableSlot for assignedSection
        testSlot = timetableSlotRepository.findBySectionIdAndIsActiveTrue(assignedSection.getId()).stream().findFirst().orElseGet(() -> {
            TimetableSlot ts = TimetableSlot.builder()
                    .sectionId(assignedSection.getId())
                    .dayOfWeek(DayOfWeek.MONDAY)
                    .startTime(LocalTime.of(10, 0))
                    .endTime(LocalTime.of(11, 0))
                    .roomId(101L)
                    .facultyId(9999L)
                    .isActive(true)
                    .build();
            return timetableSlotRepository.save(ts);
        });
    }

    @Test
    @DisplayName("Role Workspace: Comprehensive Faculty Onboarding, Self-Resolution, Timetable, Section Roster, Attendance, and Negative Boundaries")
    void testFacultyCompleteWorkflowAndSecurityBoundaries() throws Exception {
        String adminToken = loginAndGetToken("admin", "Admin@123", "ADMIN");

        // 1. Admin creates faculty member with department and credentials
        String facultyEmail = "dr.watson." + System.currentTimeMillis() + "@institution.edu";
        String facultyUsername = "dr_watson_" + System.currentTimeMillis();
        AdminFacultyController.CreateFacultyRequest createFacultyReq = new AdminFacultyController.CreateFacultyRequest(
                "John",
                "Watson",
                facultyEmail,
                testDept.getId(),
                facultyUsername,
                "Faculty@123"
        );

        MvcResult createFacultyRes = mockMvc.perform(post("/api/v1/admin/faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createFacultyReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value(facultyEmail))
                .andExpect(jsonPath("$.departmentId").value(testDept.getId()))
                .andExpect(jsonPath("$.username").value(facultyUsername))
                .andReturn();

        JsonNode facultyJson = objectMapper.readTree(createFacultyRes.getResponse().getContentAsString());
        Long facultyId = facultyJson.path("id").asLong();

        Faculty createdFaculty = facultyRepository.findById(facultyId).orElseThrow();
        Long facultyUserId = createdFaculty.getUserId();
        assertThat(facultyUserId).isNotNull();
        assertThat(userRepository.findById(facultyUserId)).isPresent();

        // 2. Faculty logs in with provisioned credentials
        String facultyToken = loginAndGetToken(facultyUsername, "Faculty@123", "FACULTY");
        assertThat(facultyToken).isNotBlank();

        // 3. Faculty queries profile (/api/v1/faculty/me)
        mockMvc.perform(get("/api/v1/faculty/me")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(facultyId))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Watson"))
                .andExpect(jsonPath("$.officialEmail").value(facultyEmail))
                .andExpect(jsonPath("$.departmentId").value(testDept.getId()))
                .andExpect(jsonPath("$.departmentName").value(testDept.getName()))
                .andExpect(jsonPath("$.userId").value(facultyUserId));

        // 4. Admin assigns faculty to assignedSection (via SectionFaculty) and timetable
        SectionFacultyAssignRequest sfReq = SectionFacultyAssignRequest.builder()
                .facultyId(facultyId)
                .role("SUBJECT_TEACHER")
                .build();
        mockMvc.perform(post("/api/v1/sections/" + assignedSection.getId() + "/faculty")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sfReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.facultyId").value(facultyId));

        testSlot.setFacultyId(facultyId);
        timetableSlotRepository.save(testSlot);

        // 5. Faculty queries assigned sections and timetable
        mockMvc.perform(get("/api/v1/faculty/me/sections")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + assignedSection.getId() + ")]").exists())
                .andExpect(jsonPath("$[?(@.id == " + unassignedSection.getId() + ")]").doesNotExist());

        mockMvc.perform(get("/api/v1/faculty/me/timetable")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.sectionId == " + assignedSection.getId() + ")]").exists());

        // 6. Faculty opens assigned section and retrieves student roster
        mockMvc.perform(get("/api/v1/sections/" + assignedSection.getId() + "/students")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.studentId == " + testStudent1.getId() + ")]").exists());

        // 7. Faculty records bulk attendance for assignedSection
        LocalDate attendanceDate = LocalDate.now();
        BulkAttendanceRequest bulkReq = new BulkAttendanceRequest(
                assignedSection.getId(),
                testSlot.getId(),
                attendanceDate,
                List.of(new AttendanceRecordEntry(testStudent1.getId(), "PRESENT", "Present in lecture"))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sectionId").value(assignedSection.getId()))
                .andExpect(jsonPath("$.scheduleId").value(testSlot.getId()))
                .andExpect(jsonPath("$.records[0].status").value("PRESENT"));

        // 8. Attendance is visible to admin
        mockMvc.perform(get("/api/v1/attendance/section/" + assignedSection.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .param("date", attendanceDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.records[0].studentId").value(testStudent1.getId()));

        // --- NEGATIVE TESTS FOR FACULTY ---
        // Negative A: Faculty cannot access unassigned section roster
        mockMvc.perform(get("/api/v1/sections/" + unassignedSection.getId() + "/students")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isForbidden());

        // Negative B: Faculty cannot record attendance on unassigned section
        BulkAttendanceRequest unassignedBulkReq = new BulkAttendanceRequest(
                unassignedSection.getId(),
                testSlot.getId(),
                attendanceDate,
                List.of(new AttendanceRecordEntry(testStudent1.getId(), "PRESENT", "Attempt"))
        );
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unassignedBulkReq)))
                .andExpect(status().isForbidden());

        // Negative C: Duplicate attendance submission rejected with 409 Conflict
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkReq)))
                .andExpect(status().isConflict());

        // Negative D: Faculty cannot create administrative users
        mockMvc.perform(post("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"hacker\",\"password\":\"Pass@123\",\"email\":\"hacker@erp.com\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Role Workspace: Student Workspace, Privacy Isolation, and Cross-Student Access Protection")
    void testStudentWorkspacePrivacyAndBoundaries() throws Exception {
        // Provision student account for Alice (Student 1)
        String aliceUsername = "alice_stu_" + System.currentTimeMillis();
        String aliceEmail = "alice.ws." + System.currentTimeMillis() + "@institutional.edu";
        AppUser aliceUser = new AppUser(aliceUsername, passwordEncoder.encode("Alice@123"), aliceEmail, Role.STUDENT, true);
        aliceUser = userRepository.save(aliceUser);
        testStudent1.setEmail(aliceEmail);
        testStudent1.setUserId(aliceUser.getId());
        testStudent1 = studentRepository.save(testStudent1);

        // Provision student account for Bob (Student 2)
        String bobUsername = "bob_stu_" + System.currentTimeMillis();
        String bobEmail = "bob.ws." + System.currentTimeMillis() + "@institutional.edu";
        AppUser bobUser = new AppUser(bobUsername, passwordEncoder.encode("Bob@123"), bobEmail, Role.STUDENT, true);
        bobUser = userRepository.save(bobUser);
        testStudent2.setEmail(bobEmail);
        testStudent2.setUserId(bobUser.getId());
        testStudent2 = studentRepository.save(testStudent2);

        // Login as Alice
        String aliceToken = loginAndGetToken(aliceUsername, "Alice@123", "STUDENT");

        // 1. Alice can view her own profile (/api/v1/students/me)
        mockMvc.perform(get("/api/v1/students/me")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(testStudent1.getId()))
                .andExpect(jsonPath("$.data.rollNumber").value("ROLL-WS-001"));

        // 2. Alice can view her own attendance
        mockMvc.perform(get("/api/v1/attendance/student/" + testStudent1.getId())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk());

        // 3. Alice CANNOT view Bob's profile (/api/v1/students/{bobId}) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/students/" + testStudent2.getId())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());

        // 4. Alice CANNOT view Bob's attendance -> 403 Forbidden
        mockMvc.perform(get("/api/v1/attendance/student/" + testStudent2.getId())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());

        // 5. Alice CANNOT view Bob's fees -> 403 Forbidden
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent2.getId())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());

        // 6. Alice CANNOT view institutional financial summary -> 403 Forbidden
        mockMvc.perform(get("/api/v1/finance/reports/summary")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());

        // 7. Alice CANNOT view section rosters -> 403 Forbidden
        mockMvc.perform(get("/api/v1/sections/" + assignedSection.getId() + "/students")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());

        // 8. Alice CANNOT modify student status -> 403 Forbidden
        mockMvc.perform(patch("/api/v1/students/" + testStudent1.getId() + "/status")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"GRADUATED\",\"remarks\":\"Self graduation\",\"effectiveDate\":\"2026-10-13\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Role Workspace: Parent Ward Management, Linked vs Unlinked Ward Boundaries")
    void testParentWorkspaceAndWardBoundaries() throws Exception {
        // Provision Parent user
        String parentUsername = "parent_user_" + System.currentTimeMillis();
        String parentEmail = "parent.ws." + System.currentTimeMillis() + "@institutional.edu";
        AppUser parentUser = new AppUser(parentUsername, passwordEncoder.encode("Parent@123"), parentEmail, Role.PARENT, true);
        parentUser = userRepository.save(parentUser);

        // Link parent to Student 1 (Alice) ONLY
        Guardian guardianAlice = new Guardian("ParentAlice", "Guardian", "MOTHER", "+919811002233", parentEmail);
        guardianAlice.setStudent(testStudent1);
        guardianAlice.setUserId(parentUser.getId());
        guardianRepository.save(guardianAlice);

        // Login as Parent
        String parentToken = loginAndGetToken(parentUsername, "Parent@123", "PARENT");

        // 1. Parent queries /api/v1/guardians/me -> sees linked ward (Alice)
        mockMvc.perform(get("/api/v1/guardians/me")
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.studentId == " + testStudent1.getId() + ")]").exists())
                .andExpect(jsonPath("$.data[?(@.studentId == " + testStudent2.getId() + ")]").doesNotExist());

        // 2. Parent can access linked ward's profile
        mockMvc.perform(get("/api/v1/students/" + testStudent1.getId())
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(testStudent1.getId()));

        // 3. Parent can access linked ward's attendance
        mockMvc.perform(get("/api/v1/attendance/student/" + testStudent1.getId())
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk());

        // 4. Parent can access linked ward's fee ledger
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent1.getId())
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk());

        // --- PARENT BOUNDARY ENFORCEMENT ---
        // 5. Parent CANNOT access unlinked student's profile (Bob) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/students/" + testStudent2.getId())
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isForbidden());

        // 6. Parent CANNOT access unlinked student's attendance (Bob) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/attendance/student/" + testStudent2.getId())
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isForbidden());

        // 7. Parent CANNOT access unlinked student's fees (Bob) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent2.getId())
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isForbidden());

        // 8. Parent CANNOT record attendance -> 403 Forbidden
        BulkAttendanceRequest parentBulkReq = new BulkAttendanceRequest(
                assignedSection.getId(),
                testSlot.getId(),
                LocalDate.now(),
                List.of(new AttendanceRecordEntry(testStudent1.getId(), "PRESENT", "Attempt"))
        );
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .header("Authorization", "Bearer " + parentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(parentBulkReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Role Workspace: Finance Operations, Financial Ledger Oversight, and Forbidden Non-Finance Operations")
    void testFinanceWorkspaceAndBoundaryEnforcement() throws Exception {
        // Login as Finance
        String financeToken = loginAndGetToken("finance", "Finance@123", "FINANCE");

        // 1. Finance can view institutional financial summary (/api/v1/finance/reports/summary)
        mockMvc.perform(get("/api/v1/finance/reports/summary")
                        .header("Authorization", "Bearer " + financeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGrossAssigned").exists())
                .andExpect(jsonPath("$.totalCollected").exists())
                .andExpect(jsonPath("$.totalOutstanding").exists());

        // 2. Finance can view all student fees (/api/v1/finance/student-fees)
        mockMvc.perform(get("/api/v1/finance/student-fees")
                        .header("Authorization", "Bearer " + financeToken))
                .andExpect(status().isOk());

        // 3. Finance can view individual student profile for verification
        mockMvc.perform(get("/api/v1/students/" + testStudent1.getId())
                        .header("Authorization", "Bearer " + financeToken))
                .andExpect(status().isOk());

        // --- FORBIDDEN OPERATIONS FOR FINANCE ---
        // 4. Finance CANNOT create faculty members -> 403 Forbidden
        mockMvc.perform(post("/api/v1/admin/faculty")
                        .header("Authorization", "Bearer " + financeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Hack\",\"lastName\":\"Prof\",\"officialEmail\":\"hack@erp.com\"}"))
                .andExpect(status().isForbidden());

        // 5. Finance CANNOT record bulk attendance -> 403 Forbidden
        BulkAttendanceRequest financeBulkReq = new BulkAttendanceRequest(
                assignedSection.getId(),
                testSlot.getId(),
                LocalDate.now(),
                List.of(new AttendanceRecordEntry(testStudent1.getId(), "PRESENT", "Attempt"))
        );
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .header("Authorization", "Bearer " + financeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(financeBulkReq)))
                .andExpect(status().isForbidden());

        // 6. Finance CANNOT create departments -> 403 Forbidden
        mockMvc.perform(post("/api/v1/departments")
                        .header("Authorization", "Bearer " + financeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Unauthorized Dept\",\"code\":\"UAD\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authorization Audit: Anonymous Direct Access Rejected Across Protected Modules")
    void testAnonymousDirectAccessRejected() throws Exception {
        // All protected endpoints must return 401 Unauthorized or 403 Forbidden when unauthenticated
        mockMvc.perform(get("/api/v1/students/me"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));

        mockMvc.perform(get("/api/v1/faculty/me"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));

        mockMvc.perform(get("/api/v1/guardians/me"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));

        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));

        mockMvc.perform(get("/api/v1/admin/faculty"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));
    }

    @Test
    @DisplayName("Persistence & Consistency: JSON Storage Directory File State Verification")
    void testDevJsonFilesIntegrity() {
        Path baseDir = devJsonProperties.getStoragePath();
        assertThat(baseDir).isNotNull();
        assertThat(Files.exists(baseDir)).isTrue();

        // Verify JSON store files exist or can be synchronized
        Path usersJson = baseDir.resolve("users.json");
        Path facultyJson = baseDir.resolve("faculty.json");

        assertThat(Files.exists(usersJson)).isTrue();
        assertThat(Files.exists(facultyJson)).isTrue();
    }
}
