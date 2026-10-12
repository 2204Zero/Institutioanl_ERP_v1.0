package com.erp.academic.course_registration.controller;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.course_registration.dto.StudentCourseRegistrationRequest;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.entity.RegistrationStatus;
import com.erp.academic.course_registration.repository.CourseRegistrationRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.common.exception.BusinessException;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class StudentCourseRegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private SemesterRepository semesterRepo;

    @Autowired
    private CourseOfferingRepository offeringRepo;

    @Autowired
    private SectionRepository sectionRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private CourseRegistrationRepository registrationRepo;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Student student1;
    private Student student2;
    private Course course;
    private Semester semester;
    private CourseOffering offering;
    private Section section;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DELETE FROM course_registration");
        jdbcTemplate.execute("DELETE FROM section_student");
        jdbcTemplate.execute("DELETE FROM section_faculty");
        jdbcTemplate.execute("DELETE FROM section");
        jdbcTemplate.execute("DELETE FROM course_offering");

        student1 = new Student(
                "STU-001", "Alice", "Student", "alice.self@college.edu", "9876543210",
                LocalDate.of(2004, 5, 15), "FEMALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        );
        student1 = studentRepo.save(student1);

        student2 = new Student(
                "STU-002", "Bob", "Student", "bob.self@college.edu", "9876543211",
                LocalDate.of(2004, 6, 20), "MALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        );
        student2 = studentRepo.save(student2);

        course = new Course();
        course.setCode("CS301");
        course.setName("Operating Systems");
        course.setCredits(4);
        course = courseRepo.save(course);

        semester = new Semester();
        semester.setName("Fall 2026");
        semester.setSemesterNumber(5);
        semester.setIsActive(true);
        semester.setStartDate(LocalDate.now());
        semester.setEndDate(LocalDate.now().plusMonths(4));
        semester = semesterRepo.save(semester);

        offering = new CourseOffering();
        offering.setCourse(course);
        offering.setSemester(semester);
        offering.setIsPublished(true);
        offering.setMaxCapacity(50);
        offering = offeringRepo.save(offering);

        section = new Section();
        section.setName("Section A");
        section.setCourseOffering(offering);
        section.setCapacity(30);
        section.setCurrentEnrollment(0);
        section.setIsActive(true);
        section = sectionRepo.save(section);
    }

    @Test
    @DisplayName("GET /api/v1/students/me/course-registrations returns only authenticated student registrations")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testGetMyRegistrations_ReturnsOnlyOwnRegistrations() throws Exception {
        CourseRegistration reg1 = CourseRegistration.builder()
                .student(student1)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.REGISTERED)
                .registeredAt(Instant.now())
                .build();
        registrationRepo.save(reg1);

        CourseRegistration reg2 = CourseRegistration.builder()
                .student(student2)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.REGISTERED)
                .registeredAt(Instant.now())
                .build();
        registrationRepo.save(reg2);

        mockMvc.perform(get("/api/v1/students/me/course-registrations")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(reg1.getId()))
                .andExpect(jsonPath("$[0].studentId").value(student1.getId()))
                .andExpect(jsonPath("$[0].studentRollNumber").value("STU-001"))
                .andExpect(jsonPath("$[0].courseOffering.course.code").value("CS301"))
                .andExpect(jsonPath("$[0].section.name").value("Section A"));
    }

    @Test
    @DisplayName("POST /api/v1/students/me/course-registrations succeeds for eligible course and section")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testRegisterCourse_Success() throws Exception {
        StudentCourseRegistrationRequest req = StudentCourseRegistrationRequest.builder()
                .courseOfferingId(offering.getId())
                .sectionId(section.getId())
                .build();

        mockMvc.perform(post("/api/v1/students/me/course-registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.studentId").value(student1.getId()))
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.courseOffering.course.name").value("Operating Systems"))
                .andExpect(jsonPath("$.section.name").value("Section A"));

        Section updatedSec = sectionRepo.findById(section.getId()).orElseThrow();
        assertThat(updatedSec.getCurrentEnrollment()).isEqualTo(1);
    }

    @Test
    @DisplayName("POST /api/v1/students/me/course-registrations rejects full section")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testRegisterCourse_RejectsFullSection() throws Exception {
        section.setCapacity(1);
        section.setCurrentEnrollment(1);
        section = sectionRepo.save(section);

        // Assign another student to fill the seat in SectionStudent
        jdbcTemplate.update("INSERT INTO section_student (section_id, student_id, is_active, assigned_at) VALUES (?, ?, true, CURRENT_TIMESTAMP)",
                section.getId(), student2.getId());

        StudentCourseRegistrationRequest req = StudentCourseRegistrationRequest.builder()
                .courseOfferingId(offering.getId())
                .sectionId(section.getId())
                .build();

        mockMvc.perform(post("/api/v1/students/me/course-registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("capacity exceeded")));
    }

    @Test
    @DisplayName("POST /api/v1/students/me/course-registrations rejects missing fields with 400 Bad Request")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testRegisterCourse_RejectsMissingFields() throws Exception {
        StudentCourseRegistrationRequest invalidReq = new StudentCourseRegistrationRequest();

        mockMvc.perform(post("/api/v1/students/me/course-registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/students/me/course-registrations rejects duplicate registration")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testRegisterCourse_RejectsDuplicate() throws Exception {
        StudentCourseRegistrationRequest req = StudentCourseRegistrationRequest.builder()
                .courseOfferingId(offering.getId())
                .sectionId(section.getId())
                .build();

        // First registration succeeds
        mockMvc.perform(post("/api/v1/students/me/course-registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Second registration must fail with 409 Conflict
        mockMvc.perform(post("/api/v1/students/me/course-registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    @DisplayName("POST /api/v1/students/me/course-registrations reactivates dropped registration")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testRegisterCourse_ReactivatesDroppedRegistration() throws Exception {
        CourseRegistration droppedReg = CourseRegistration.builder()
                .student(student1)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.DROPPED)
                .registeredAt(Instant.now().minusSeconds(3600))
                .droppedAt(Instant.now().minusSeconds(1800))
                .build();
        droppedReg = registrationRepo.save(droppedReg);

        StudentCourseRegistrationRequest req = StudentCourseRegistrationRequest.builder()
                .courseOfferingId(offering.getId())
                .sectionId(section.getId())
                .build();

        mockMvc.perform(post("/api/v1/students/me/course-registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(droppedReg.getId()))
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.droppedAt").doesNotExist());
    }

    @Test
    @DisplayName("DELETE /api/v1/students/me/course-registrations/{id} withdraws owned registration")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testWithdrawRegistration_Success() throws Exception {
        CourseRegistration reg = CourseRegistration.builder()
                .student(student1)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.REGISTERED)
                .registeredAt(Instant.now())
                .build();
        reg = registrationRepo.save(reg);

        mockMvc.perform(delete("/api/v1/students/me/course-registrations/" + reg.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reg.getId()))
                .andExpect(jsonPath("$.status").value("DROPPED"))
                .andExpect(jsonPath("$.droppedAt", notNullValue()));
    }

    @Test
    @DisplayName("DELETE /api/v1/students/me/course-registrations/{id} rejects withdrawal of another student registration")
    @WithMockUser(username = "alice.self@college.edu", roles = "STUDENT")
    void testWithdrawRegistration_RejectsOtherStudent() throws Exception {
        CourseRegistration regBob = CourseRegistration.builder()
                .student(student2)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.REGISTERED)
                .registeredAt(Instant.now())
                .build();
        regBob = registrationRepo.save(regBob);

        mockMvc.perform(delete("/api/v1/students/me/course-registrations/" + regBob.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to /api/v1/students/me/course-registrations returns 401 Unauthorized")
    void testUnauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/students/me/course-registrations")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin or Faculty request to /api/v1/students/me/course-registrations returns 403 Forbidden")
    @WithMockUser(roles = "ADMIN")
    void testAdminAccessToMeEndpoint_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/students/me/course-registrations")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
