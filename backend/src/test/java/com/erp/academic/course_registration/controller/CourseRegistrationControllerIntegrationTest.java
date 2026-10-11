package com.erp.academic.course_registration.controller;

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
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CourseRegistrationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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

    private Student testStudent;
    private Course testCourse;
    private Semester testSemester;
    private CourseOffering testOffering;
    private Section testSection;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DELETE FROM course_registration");
        jdbcTemplate.execute("DELETE FROM section_student");
        jdbcTemplate.execute("DELETE FROM section_faculty");
        jdbcTemplate.execute("DELETE FROM section");
        jdbcTemplate.execute("DELETE FROM course_offering");

        testCourse = new Course();
        testCourse.setCode("CS401");
        testCourse.setName("Distributed Systems");
        testCourse.setCredits(4);
        testCourse = courseRepo.save(testCourse);

        testSemester = new Semester();
        testSemester.setName("Fall 2026");
        testSemester.setSemesterNumber(7);
        testSemester.setIsActive(true);
        testSemester.setStartDate(LocalDate.now());
        testSemester.setEndDate(LocalDate.now().plusMonths(4));
        testSemester = semesterRepo.save(testSemester);

        testOffering = new CourseOffering();
        testOffering.setCourse(testCourse);
        testOffering.setSemester(testSemester);
        testOffering.setIsPublished(true);
        testOffering.setMaxCapacity(50);
        testOffering = offeringRepo.save(testOffering);

        testSection = new Section();
        testSection.setName("Section A");
        testSection.setCourseOffering(testOffering);
        testSection.setCapacity(40);
        testSection.setCurrentEnrollment(0);
        testSection.setIsActive(true);
        testSection = sectionRepo.save(testSection);

        testStudent = new Student(
                "REG-STU-01", "Alice", "Smith", "alice.smith@college.edu", "9876543210",
                LocalDate.of(2004, 5, 15), "FEMALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        );
        testStudent = studentRepo.save(testStudent);
    }

    @Test
    @DisplayName("GET /api/v1/course-registrations?studentId=... as ADMIN serializes DTO cleanly without proxy leak")
    @WithMockUser(roles = "ADMIN")
    void testGetRegistrations_AsAdmin_SerializesCleanDto() throws Exception {
        CourseRegistration reg = CourseRegistration.builder()
                .student(testStudent)
                .courseOffering(testOffering)
                .section(testSection)
                .status(RegistrationStatus.REGISTERED)
                .registeredAt(Instant.now())
                .build();
        registrationRepo.save(reg);

        mockMvc.perform(get("/api/v1/course-registrations")
                        .param("studentId", testStudent.getId().toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(reg.getId()))
                .andExpect(jsonPath("$[0].studentId").value(testStudent.getId()))
                .andExpect(jsonPath("$[0].studentName").value("Alice Smith"))
                .andExpect(jsonPath("$[0].studentRollNumber").value("REG-STU-01"))
                .andExpect(jsonPath("$[0].status").value("REGISTERED"))
                .andExpect(jsonPath("$[0].courseOffering.id").value(testOffering.getId()))
                .andExpect(jsonPath("$[0].courseOffering.course.code").value("CS401"))
                .andExpect(jsonPath("$[0].courseOffering.course.name").value("Distributed Systems"))
                .andExpect(jsonPath("$[0].courseOffering.semester.name").value("Fall 2026"))
                .andExpect(jsonPath("$[0].section.id").value(testSection.getId()))
                .andExpect(jsonPath("$[0].section.name").value("Section A"));
    }

    @Test
    @DisplayName("GET /api/v1/course-registrations?studentId=... as SUPER_ADMIN succeeds")
    @WithMockUser(roles = "SUPER_ADMIN")
    void testGetRegistrations_AsSuperAdmin_Succeeds() throws Exception {
        mockMvc.perform(get("/api/v1/course-registrations")
                        .param("studentId", testStudent.getId().toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/v1/course-registrations as STUDENT is forbidden (403)")
    @WithMockUser(roles = "STUDENT")
    void testGetRegistrations_AsStudent_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/course-registrations")
                        .param("studentId", testStudent.getId().toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/course-registrations as ADMIN creates registration and returns DTO")
    @WithMockUser(roles = "ADMIN")
    void testRegisterStudent_AsAdmin_CreatesRegistration() throws Exception {
        mockMvc.perform(post("/api/v1/course-registrations")
                        .param("studentId", testStudent.getId().toString())
                        .param("courseOfferingId", testOffering.getId().toString())
                        .param("sectionId", testSection.getId().toString())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.studentId").value(testStudent.getId()))
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.courseOffering.course.name").value("Distributed Systems"))
                .andExpect(jsonPath("$.section.name").value("Section A"));
    }

    @Test
    @DisplayName("PATCH /api/v1/course-registrations/{id}/drop drops registration and returns updated DTO")
    @WithMockUser(roles = "ADMIN")
    void testDropCourse_AsAdmin_DropsAndReturnsDto() throws Exception {
        CourseRegistration reg = CourseRegistration.builder()
                .student(testStudent)
                .courseOffering(testOffering)
                .section(testSection)
                .status(RegistrationStatus.REGISTERED)
                .registeredAt(Instant.now())
                .build();
        reg = registrationRepo.save(reg);

        mockMvc.perform(patch("/api/v1/course-registrations/" + reg.getId() + "/drop")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reg.getId()))
                .andExpect(jsonPath("$.status").value("DROPPED"))
                .andExpect(jsonPath("$.droppedAt", notNullValue()));
    }
}
