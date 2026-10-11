package com.erp.attendance;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.entity.SectionFaculty;
import com.erp.academic.section.entity.SectionStudent;
import com.erp.academic.section.repository.SectionFacultyRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import com.erp.attendance.dto.AttendanceRecordEntry;
import com.erp.attendance.dto.AttendanceRecordRequest;
import com.erp.attendance.dto.BulkAttendanceRequest;
import com.erp.attendance.entity.StudentAttendanceRecord;
import com.erp.attendance.repository.StudentAttendanceRecordRepository;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AttendanceWorkflowSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentAttendanceRecordRepository attendanceRepo;

    @Autowired
    private SectionRepository sectionRepo;

    @Autowired
    private SectionStudentRepository sectionStudentRepo;

    @Autowired
    private SectionFacultyRepository sectionFacultyRepo;

    @Autowired
    private TimetableSlotRepository timetableSlotRepo;

    @Autowired
    private FacultyRepository facultyRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private SemesterRepository semesterRepo;

    @Autowired
    private CourseOfferingRepository offeringRepo;

    @Autowired
    private GuardianRepository guardianRepo;

    private Faculty facultyA;
    private Faculty facultyB;
    private Section sectionAssigned;
    private Section sectionUnassigned;
    private TimetableSlot slotAssigned;
    private TimetableSlot slotUnassigned;
    private Student student1;
    private Student student2;

    @BeforeEach
    void setUp() {
        guardianRepo.deleteAll();
        attendanceRepo.deleteAll();

        // 1. Setup Faculty
        facultyA = facultyRepo.save(Faculty.builder()
                .firstName("Alice")
                .lastName("Prof")
                .officialEmail("alice.faculty@erp.com")
                .isActive(true)
                .build());

        facultyB = facultyRepo.save(Faculty.builder()
                .firstName("Bob")
                .lastName("Prof")
                .officialEmail("bob.faculty@erp.com")
                .isActive(true)
                .build());

        // 2. Setup Academics & Sections
        Course course = new Course();
        course.setCode("CS-ATT-" + UUID.randomUUID().toString().substring(0, 5));
        course.setName("Computer Networks");
        course.setCredits(4);
        course.setIsActive(true);
        course = courseRepo.save(course);

        Semester semester = new Semester();
        semester.setName("Fall Attendance 2026");
        semester.setIsActive(true);
        semester = semesterRepo.save(semester);

        CourseOffering offering = offeringRepo.save(CourseOffering.builder()
                .course(course)
                .semester(semester)
                .maxCapacity(60)
                .isPublished(true)
                .build());

        sectionAssigned = sectionRepo.save(Section.builder()
                .name("Section A - Assigned")
                .courseOffering(offering)
                .capacity(50)
                .currentEnrollment(2)
                .isActive(true)
                .build());

        sectionUnassigned = sectionRepo.save(Section.builder()
                .name("Section B - Unassigned")
                .courseOffering(offering)
                .capacity(50)
                .currentEnrollment(0)
                .isActive(true)
                .build());

        // Assign Faculty A to Section Assigned, Faculty B to Section Unassigned
        sectionFacultyRepo.save(SectionFaculty.builder()
                .sectionId(sectionAssigned.getId())
                .facultyId(facultyA.getId())
                .role("PRIMARY")
                .build());

        sectionFacultyRepo.save(SectionFaculty.builder()
                .sectionId(sectionUnassigned.getId())
                .facultyId(facultyB.getId())
                .role("PRIMARY")
                .build());

        // 3. Timetable Slots
        slotAssigned = timetableSlotRepo.save(TimetableSlot.builder()
                .sectionId(sectionAssigned.getId())
                .facultyId(facultyA.getId())
                .roomId(101L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .isActive(true)
                .build());

        slotUnassigned = timetableSlotRepo.save(TimetableSlot.builder()
                .sectionId(sectionUnassigned.getId())
                .facultyId(facultyB.getId())
                .roomId(102L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .isActive(true)
                .build());

        // 4. Students enrolled in Section Assigned
        student1 = new Student();
        student1.setFirstName("John");
        student1.setLastName("Doe");
        student1.setRollNumber("ROLL-" + UUID.randomUUID().toString().substring(0, 5));
        student1.setEmail("john.doe@student.com");
        student1.setPhone("9876543210");
        student1.setDateOfBirth(LocalDate.of(2003, 1, 1));
        student1.setGender("MALE");
        student1.setDepartment("CSE");
        student1.setBatch("2024-2028");
        student1.setEnrollmentDate(LocalDate.of(2024, 8, 1));
        student1.setStatus(StudentStatus.ACTIVE);
        student1 = studentRepo.save(student1);

        student2 = new Student();
        student2.setFirstName("Jane");
        student2.setLastName("Smith");
        student2.setRollNumber("ROLL-" + UUID.randomUUID().toString().substring(0, 5));
        student2.setEmail("jane.smith@student.com");
        student2.setPhone("9876543211");
        student2.setDateOfBirth(LocalDate.of(2003, 2, 2));
        student2.setGender("FEMALE");
        student2.setDepartment("CSE");
        student2.setBatch("2024-2028");
        student2.setEnrollmentDate(LocalDate.of(2024, 8, 1));
        student2.setStatus(StudentStatus.ACTIVE);
        student2 = studentRepo.save(student2);

        sectionStudentRepo.save(SectionStudent.builder()
                .sectionId(sectionAssigned.getId())
                .studentId(student1.getId())
                .isActive(true)
                .build());

        sectionStudentRepo.save(SectionStudent.builder()
                .sectionId(sectionAssigned.getId())
                .studentId(student2.getId())
                .isActive(true)
                .build());
    }

    // ==================== 1. Unauthenticated Checks (401) ====================

    @Test
    @DisplayName("Unauthenticated caller cannot record bulk attendance -> 401")
    void unauthenticated_cannotRecordBulkAttendance_returns401() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "PRESENT", null))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated caller cannot get section attendance -> 401")
    void unauthenticated_cannotGetSectionAttendance_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/section/" + sectionAssigned.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated caller cannot take single attendance -> 401")
    void unauthenticated_cannotTakeAttendance_returns401() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(student1.getId(), "CS101", "PRESENT", "Note");
        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unauthenticated caller cannot get all attendance -> 401")
    void unauthenticated_cannotGetAllAttendance_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/attendance"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== 2. Student & Parent Restrictions (403) ====================

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    @DisplayName("Student role cannot record bulk attendance -> 403")
    void student_cannotRecordBulkAttendance_returns403() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "PRESENT", null))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    @DisplayName("Student role cannot get section attendance -> 403")
    void student_cannotGetSectionAttendance_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/section/" + sectionAssigned.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    @DisplayName("Student role cannot take single attendance -> 403")
    void student_cannotTakeAttendance_returns403() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(student1.getId(), "CS101", "PRESENT", "Tamper");
        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    @DisplayName("Student role cannot list all attendance globally -> 403")
    void student_cannotGetAllAttendance_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "parent@erp.com", roles = {"PARENT"})
    @DisplayName("Parent role cannot record bulk attendance -> 403")
    void parent_cannotRecordBulkAttendance_returns403() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "PRESENT", null))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // ==================== 3. Faculty Ownership Checks (DEF-03) ====================

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Assigned faculty can record bulk attendance -> 201")
    void faculty_canRecordBulkAttendance_forAssignedSection_returns201() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(
                        new AttendanceRecordEntry(student1.getId(), "PRESENT", "On time"),
                        new AttendanceRecordEntry(student2.getId(), "ABSENT", "Sick")
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sectionId").value(sectionAssigned.getId()))
                .andExpect(jsonPath("$.records.length()").value(2));

        assertThat(attendanceRepo.findAll()).hasSize(2);
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Faculty cannot record bulk attendance for unassigned section -> 403")
    void faculty_cannotRecordBulkAttendance_forUnassignedSection_returns403() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionUnassigned.getId(), slotUnassigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "PRESENT", null))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Assigned faculty can get section attendance -> 200")
    void faculty_canGetSectionAttendance_forAssignedSection_returns200() throws Exception {
        LocalDate today = LocalDate.now();
        attendanceRepo.save(StudentAttendanceRecord.builder()
                .studentId(student1.getId())
                .scheduleId(slotAssigned.getId())
                .attendanceDate(today)
                .status("PRESENT")
                .markedByFacultyId(facultyA.getId())
                .build());

        mockMvc.perform(get("/api/v1/attendance/section/" + sectionAssigned.getId())
                        .param("date", today.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sectionId").value(sectionAssigned.getId()))
                .andExpect(jsonPath("$.records.length()").value(1));
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Faculty cannot get attendance for unassigned section -> 403")
    void faculty_cannotGetSectionAttendance_forUnassignedSection_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/section/" + sectionUnassigned.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Faculty cannot view global attendance across all sections -> 403")
    void faculty_cannotGetAllAttendance_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance"))
                .andExpect(status().isForbidden());
    }

    // ==================== 4. Administrative Reliability (DEF-03) ====================

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    @DisplayName("Admin without faculty profile can record bulk attendance -> 201")
    void admin_canRecordBulkAttendance_withoutFacultyProfile_returns201() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "PRESENT", "Admin override"))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sectionId").value(sectionAssigned.getId()));

        assertThat(attendanceRepo.findAll()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    @DisplayName("Admin without faculty profile can read section attendance -> 200")
    void admin_canGetSectionAttendance_anySection_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/section/" + sectionAssigned.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sectionId").value(sectionAssigned.getId()));
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    @DisplayName("Admin can view global attendance -> 200")
    void admin_canGetAllAttendance_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/attendance"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "superadmin@erp.com", roles = {"SUPER_ADMIN"})
    @DisplayName("Super admin can record bulk attendance -> 201")
    void superAdmin_canRecordBulkAttendance_returns201() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "LATE", "Authorized late"))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        assertThat(attendanceRepo.findAll()).hasSize(1);
    }

    // ==================== 5. Batch Validation & Rollback (DEF-04) ====================

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Batch with unenrolled student fails and rolls back -> 400 and 0 saved")
    void batch_unenrolledStudent_returns400_andRollsBack() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(
                        new AttendanceRecordEntry(student1.getId(), "PRESENT", null),
                        new AttendanceRecordEntry(99999L, "ABSENT", null) // Not enrolled!
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        // Zero records saved due to rollback
        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Batch with duplicate student ID fails -> 400 and 0 saved")
    void batch_duplicateStudentInBatch_returns400() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(
                        new AttendanceRecordEntry(student1.getId(), "PRESENT", null),
                        new AttendanceRecordEntry(student1.getId(), "ABSENT", null) // Duplicate!
                )
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Duplicate submission for same schedule/date returns 409 Conflict")
    void batch_duplicateSubmission_returns409() throws Exception {
        LocalDate date = LocalDate.now();
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), date,
                List.of(new AttendanceRecordEntry(student1.getId(), "PRESENT", null))
        );

        // 1st submit -> 201
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // 2nd submit -> 409
        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Batch with invalid attendance status returns 400")
    void batch_invalidStatus_returns400() throws Exception {
        BulkAttendanceRequest request = new BulkAttendanceRequest(
                sectionAssigned.getId(), slotAssigned.getId(), LocalDate.now(),
                List.of(new AttendanceRecordEntry(student1.getId(), "INVALID_STATUS", null))
        );

        mockMvc.perform(post("/api/v1/attendance/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    // ==================== 6. Single-Record Workflow (DEF-07) ====================

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record attendance accepts custom date and scheduleId -> 201")
    void singleRecord_withCustomDateAndSchedule_returns201() throws Exception {
        LocalDate pastDate = LocalDate.of(2026, 9, 15);
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Historical lecture", pastDate, slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(student1.getId()))
                .andExpect(jsonPath("$.date").value(pastDate.toString()))
                .andExpect(jsonPath("$.status").value("PRESENT"));

        List<StudentAttendanceRecord> saved = attendanceRepo.findAll();
        assertThat(saved).hasSize(1);
        assertThat(saved.get(0).getAttendanceDate()).isEqualTo(pastDate);
        assertThat(saved.get(0).getScheduleId()).isEqualTo(slotAssigned.getId());
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record duplicate submission returns 409 Conflict")
    void singleRecord_duplicateSubmission_returns409() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 20);
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Lecture", date, slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    // ==================== 7. Section Roster & Faculty Visibility (DEF-08) ====================

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Unassigned faculty cannot access section faculty list -> 403")
    void sectionFaculty_unassignedFaculty_cannotAccessSectionFaculty_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/sections/" + sectionUnassigned.getId() + "/faculty"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Assigned faculty can access section faculty list -> 200")
    void sectionFaculty_assignedFaculty_canAccessSectionFaculty_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/sections/" + sectionAssigned.getId() + "/faculty"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].facultyId").value(facultyA.getId()));
    }

    // ==================== 8. Student Attendance Read Authorization (IDOR Closure) ====================

    @Test
    @DisplayName("Unauthenticated caller cannot read student attendance -> 401")
    void unauthenticated_cannotGetStudentAttendance_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "john.doe@student.com", roles = {"STUDENT"})
    @DisplayName("Student can view their own attendance -> 200")
    void student_canViewOwnAttendance_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "john.doe@student.com", roles = {"STUDENT"})
    @DisplayName("Student cannot view another student's attendance (IDOR blocked) -> 403")
    void student_cannotViewOtherStudentAttendance_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/student/" + student2.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "parent.alice@erp.com", roles = {"PARENT"})
    @DisplayName("Parent can view linked student attendance -> 200")
    void parent_canViewLinkedStudentAttendance_returns200() throws Exception {
        Guardian guardian = new Guardian("Parent", "Doe", "FATHER", "9998887771", "parent.alice@erp.com");
        guardian.setStudent(student1);
        guardianRepo.save(guardian);

        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "parent.alice@erp.com", roles = {"PARENT"})
    @DisplayName("Parent cannot view unlinked student attendance -> 403")
    void parent_cannotViewUnlinkedStudentAttendance_returns403() throws Exception {
        Guardian guardian = new Guardian("Parent", "Doe", "FATHER", "9998887771", "parent.alice@erp.com");
        guardian.setStudent(student1);
        guardianRepo.save(guardian);

        mockMvc.perform(get("/api/v1/attendance/student/" + student2.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Faculty can view attendance for student in assigned section, scoped to faculty sections -> 200")
    void faculty_canViewStudentAttendance_whenStudentInAssignedSection_scoped_returns200() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 21);
        // Record 1: in Faculty A's section
        attendanceRepo.save(StudentAttendanceRecord.builder()
                .studentId(student1.getId())
                .scheduleId(slotAssigned.getId())
                .attendanceDate(date)
                .status("PRESENT")
                .markedByFacultyId(facultyA.getId())
                .build());

        // Record 2: in another section's schedule
        attendanceRepo.save(StudentAttendanceRecord.builder()
                .studentId(student1.getId())
                .scheduleId(slotUnassigned.getId())
                .attendanceDate(date)
                .status("PRESENT")
                .markedByFacultyId(facultyB.getId())
                .build());

        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentId").value(student1.getId()));

        // Proves that admin sees all records (length 2) while faculty was scoped to 1
        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId())
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin@erp.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "bob.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Faculty cannot view attendance for student not enrolled in any of faculty's sections -> 403")
    void faculty_cannotViewStudentAttendance_whenStudentNotInFacultySections_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    @DisplayName("Admin can view any student attendance globally -> 200")
    void admin_canViewAnyStudentAttendance_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "superadmin@erp.com", roles = {"SUPER_ADMIN"})
    @DisplayName("Super admin can view any student attendance globally -> 200")
    void superAdmin_canViewAnyStudentAttendance_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/student/" + student1.getId()))
                .andExpect(status().isOk());
    }

    // ==================== 9. Single-Record Attendance Audit & Validation ====================

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record missing schedule ID and invalid courseCode fails with 400 Bad Request")
    void singleRecord_missingScheduleId_unresolvedCourse_returns400() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "UNKNOWN-COURSE", "PRESENT", "Note", LocalDate.now(), null
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record nonexistent schedule ID fails with 400 Bad Request")
    void singleRecord_nonexistentScheduleId_returns400() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Note", LocalDate.now(), 999999L
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record faculty using schedule of unassigned section returns 403 Forbidden")
    void singleRecord_facultyUsingScheduleOfUnassignedSection_returns403() throws Exception {
        // Faculty A tries to mark attendance using slotUnassigned (which belongs to sectionUnassigned, where Faculty A is not assigned)
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Note", LocalDate.now(), slotUnassigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    @DisplayName("Single-record schedule belonging to section where student is not enrolled returns 400 Bad Request")
    void singleRecord_scheduleBelongingToSectionWhereStudentNotEnrolled_returns400() throws Exception {
        // Admin supplies slotUnassigned (sectionUnassigned), where student1 is not enrolled
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Note", LocalDate.now(), slotUnassigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "bob.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Unassigned faculty taking single attendance returns 403 Forbidden")
    void singleRecord_unassignedFaculty_returns403() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Note", LocalDate.now(), slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record student not enrolled in section returns 400 Bad Request")
    void singleRecord_studentNotEnrolledInSection_returns400() throws Exception {
        Student student3 = new Student();
        student3.setFirstName("Unenrolled");
        student3.setLastName("Student");
        student3.setRollNumber("ROLL-" + UUID.randomUUID().toString().substring(0, 5));
        student3.setEmail("unenrolled@student.com");
        student3.setPhone("9876543299");
        student3.setDateOfBirth(LocalDate.of(2003, 3, 3));
        student3.setGender("MALE");
        student3.setDepartment("CSE");
        student3.setBatch("2024-2028");
        student3.setEnrollmentDate(LocalDate.of(2024, 8, 1));
        student3.setStatus(com.erp.student.entity.StudentStatus.ACTIVE);
        student3 = studentRepo.save(student3);

        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student3.getId(), "CS101", "PRESENT", "Note", LocalDate.now(), slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice.faculty@erp.com", roles = {"FACULTY"})
    @DisplayName("Single-record invalid attendance status returns 400 Bad Request")
    void singleRecord_invalidStatus_returns400() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "INVALID_STATUS", "Note", LocalDate.now(), slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    @DisplayName("Admin can record valid single-record attendance -> 201 Created")
    void singleRecord_admin_canRecordValidAttendance_returns201() throws Exception {
        LocalDate date = LocalDate.of(2026, 9, 25);
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Admin recording", date, slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(student1.getId()))
                .andExpect(jsonPath("$.date").value(date.toString()));

        assertThat(attendanceRepo.findAll()).hasSize(1);
    }

    // ==================== 10. Faculty Identity Fallback Security ====================

    @Test
    @WithMockUser(username = "unknown.stranger@erp.com", roles = {"FACULTY"})
    @DisplayName("Unknown faculty email cannot resolve another faculty or record attendance -> 403")
    void facultyFallback_unknownEmail_cannotMarkAttendance_returns403() throws Exception {
        AttendanceRecordRequest request = new AttendanceRecordRequest(
                student1.getId(), "CS101", "PRESENT", "Intruder", LocalDate.now(), slotAssigned.getId()
        );

        mockMvc.perform(post("/api/v1/attendance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        assertThat(attendanceRepo.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "unknown.stranger@erp.com", roles = {"FACULTY"})
    @DisplayName("Unknown faculty email cannot access section attendance -> 403")
    void facultyFallback_unknownEmail_cannotAccessSection_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/attendance/section/" + sectionAssigned.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isForbidden());
    }
}
