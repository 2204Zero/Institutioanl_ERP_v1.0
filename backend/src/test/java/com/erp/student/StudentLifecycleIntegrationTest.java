package com.erp.student;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.entity.RegistrationStatus;
import com.erp.academic.course_registration.repository.CourseRegistrationRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import com.erp.student.repository.StudentStatusHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class StudentLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private CourseOfferingRepository offeringRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private CourseRegistrationRepository registrationRepository;

    private Student testStudent;
    private AppUser studentUser;
    private AppUser parentUser;
    private Guardian testGuardian;

    @BeforeEach
    void setUp() {
        long timestamp = System.currentTimeMillis();

        studentUser = new AppUser("lifecycle_student_" + timestamp, "hash", "student." + timestamp + "@test.com", Role.STUDENT, true);
        studentUser = userRepository.save(studentUser);

        parentUser = new AppUser("lifecycle_parent_" + timestamp, "hash", "parent." + timestamp + "@test.com", Role.PARENT, true);
        parentUser = userRepository.save(parentUser);

        testStudent = new Student(
                "ENR" + timestamp,
                "Siddharth",
                "Malhotra",
                "student." + timestamp + "@test.com",
                "+919876543299",
                LocalDate.of(2003, 10, 15),
                "MALE",
                "Computer Science and Engineering",
                "2023-2027",
                LocalDate.of(2023, 8, 1)
        );
        testStudent.setStatus(StudentStatus.ACTIVE);
        testStudent.setUserId(studentUser.getId());
        testStudent = studentRepository.save(testStudent);

        testGuardian = new Guardian("Rajesh", "Malhotra", "FATHER", "+919811223344", "parent." + timestamp + "@test.com");
        testGuardian.setStudent(testStudent);
        testGuardian.setUserId(parentUser.getId());
        testGuardian = guardianRepository.save(testGuardian);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Complete valid lifecycle progression: ACTIVE -> SUSPENDED -> ACTIVE -> GRADUATED -> ALUMNI with audit persistence")
    void testValidLifecycleProgression() throws Exception {
        Long studentId = testStudent.getId();

        // 1. ACTIVE -> SUSPENDED
        StudentStatusUpdateDto suspendDto = new StudentStatusUpdateDto(
                StudentStatus.SUSPENDED,
                "Attendance shortage",
                "admin",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUSPENDED")));

        // 2. SUSPENDED -> ACTIVE (Reinstatement)
        StudentStatusUpdateDto reinstateDto = new StudentStatusUpdateDto(
                StudentStatus.ACTIVE,
                "Reinstated after review",
                "admin",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reinstateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));

        // 3. ACTIVE -> GRADUATED
        StudentStatusUpdateDto graduateDto = new StudentStatusUpdateDto(
                StudentStatus.GRADUATED,
                "Degree requirements completed",
                "admin",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(graduateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("GRADUATED")));

        // 4. GRADUATED -> ALUMNI
        StudentStatusUpdateDto alumniDto = new StudentStatusUpdateDto(
                StudentStatus.ALUMNI,
                "Convocation held, enrolled in Alumni Portal",
                "alumni_office",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(alumniDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ALUMNI")));

        // 5. Verify audit history contains chronological records
        mockMvc.perform(get("/api/v1/students/" + studentId + "/status-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(4)))
                .andExpect(jsonPath("$.data[0].newStatus", is("ALUMNI")))
                .andExpect(jsonPath("$.data[0].previousStatus", is("GRADUATED")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Invalid transitions and premature ALUMNI status must be rejected with 409 Conflict")
    void testInvalidTransitionsRejected() throws Exception {
        Long studentId = testStudent.getId();

        // 1. Direct ACTIVE -> ALUMNI is rejected
        StudentStatusUpdateDto prematureAlumni = new StudentStatusUpdateDto(
                StudentStatus.ALUMNI,
                "Premature transition",
                "admin",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prematureAlumni)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Invalid status transition from ACTIVE to ALUMNI")));

        // 2. Set student to GRADUATED -> ALUMNI
        testStudent.setStatus(StudentStatus.ALUMNI);
        studentRepository.save(testStudent);

        // 3. From ALUMNI (terminal), attempting transition to ACTIVE is rejected
        StudentStatusUpdateDto terminalToActive = new StudentStatusUpdateDto(
                StudentStatus.ACTIVE,
                "Reactivate alumni",
                "admin",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + studentId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(terminalToActive)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Invalid status transition from ALUMNI to ACTIVE")));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    @DisplayName("Unauthorized roles (STUDENT) are blocked from modifying student status with 403 Forbidden")
    void testUnauthorizedStatusModificationBlocked() throws Exception {
        StudentStatusUpdateDto updateDto = new StudentStatusUpdateDto(
                StudentStatus.GRADUATED,
                "Self graduation",
                "student",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + testStudent.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Historical academic course registrations remain fully preserved and accessible after transition to ALUMNI")
    void testHistoricalRecordsPreservedAfterAlumniTransition() throws Exception {
        // Setup historical course registration
        Course course = new Course();
        course.setCode("HIST101");
        course.setName("World History");
        course.setCourseType("THEORY");
        course.setCredits(3);
        course.setIsActive(true);
        course = courseRepository.save(course);

        Semester sem = new Semester();
        sem.setName("Historical Fall 2023");
        sem.setSemesterNumber(1);
        sem.setStartDate(LocalDate.of(2023, 8, 1));
        sem.setEndDate(LocalDate.of(2023, 12, 15));
        sem.setIsActive(false);
        sem = semesterRepository.save(sem);

        CourseOffering offering = CourseOffering.builder()
                .course(course)
                .semester(sem)
                .maxCapacity(50)
                .isPublished(true)
                .build();
        offering = offeringRepository.save(offering);

        Section section = Section.builder()
                .name("A")
                .courseOffering(offering)
                .capacity(50)
                .currentEnrollment(1)
                .build();
        section = sectionRepository.save(section);

        CourseRegistration reg = CourseRegistration.builder()
                .student(testStudent)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.REGISTERED)
                .build();
        registrationRepository.save(reg);

        // Transition student to GRADUATED -> ALUMNI
        testStudent.setStatus(StudentStatus.GRADUATED);
        studentRepository.save(testStudent);

        StudentStatusUpdateDto alumniDto = new StudentStatusUpdateDto(
                StudentStatus.ALUMNI,
                "Enrolled in Alumni Association",
                "admin",
                LocalDate.now()
        );
        mockMvc.perform(patch("/api/v1/students/" + testStudent.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(alumniDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ALUMNI")));

        // Verify historical registration is preserved
        var regs = registrationRepository.findByStudentId(testStudent.getId());
        assertEquals(1, regs.size());
        assertEquals("HIST101", regs.get(0).getCourseOffering().getCourse().getCode());
        assertEquals(RegistrationStatus.REGISTERED, regs.get(0).getStatus());
    }
}
