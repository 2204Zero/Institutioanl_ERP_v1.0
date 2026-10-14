package com.erp.academic.course;

import com.erp.academic.course.dto.CourseCreateRequest;
import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CoursePrerequisiteRepository;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course.service.CoursePrerequisiteService;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.entity.RegistrationStatus;
import com.erp.academic.course_registration.repository.CourseRegistrationRepository;
import com.erp.academic.course_registration.service.CourseRegistrationService;
import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.auth.dto.LoginRequest;
import com.erp.common.exception.BusinessException;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AcademicPrerequisitesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CoursePrerequisiteRepository prerequisiteRepository;

    @Autowired
    private CoursePrerequisiteService prerequisiteService;

    @Autowired
    private CourseRegistrationService registrationService;

    @Autowired
    private CourseRegistrationRepository registrationRepository;

    @Autowired
    private CourseOfferingRepository offeringRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private StudentRepository studentRepository;

    private Course course101;
    private Course course201;
    private Department department;
    private Student testStudent;
    private Semester semester;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setName("Computer Science");
        department.setCode("CS-" + System.currentTimeMillis());
        department = departmentRepository.save(department);

        course101 = new Course();
        course101.setName("Intro to Programming");
        course101.setCode("CS101-" + System.currentTimeMillis());
        course101.setCourseType("THEORY");
        course101.setCredits(3);
        course101.setDepartmentId(department.getId());
        course101.setIsActive(true);
        course101 = courseRepository.save(course101);

        course201 = new Course();
        course201.setName("Data Structures");
        course201.setCode("CS201-" + System.currentTimeMillis());
        course201.setCourseType("THEORY");
        course201.setCredits(4);
        course201.setDepartmentId(department.getId());
        course201.setIsActive(true);
        course201 = courseRepository.save(course201);

        AcademicYear ay = new AcademicYear();
        ay.setName("2026-2027");
        ay.setStartDate(LocalDate.now().minusMonths(1));
        ay.setEndDate(LocalDate.now().plusMonths(5));
        ay.setIsActive(true);
        ay = academicYearRepository.save(ay);

        semester = new Semester();
        semester.setName("Fall 2026");
        semester.setSemesterNumber(1);
        semester.setAcademicYearId(ay.getId());
        semester.setStartDate(LocalDate.now().minusMonths(1));
        semester.setEndDate(LocalDate.now().plusMonths(5));
        semester.setIsActive(true);
        semester = semesterRepository.save(semester);

        testStudent = new Student(
                "ROLL-" + System.currentTimeMillis(),
                "John",
                "Doe",
                "john.doe." + System.currentTimeMillis() + "@erp.com",
                "+1234567890",
                LocalDate.of(2003, 5, 15),
                "MALE",
                "Computer Science",
                "2026-2030",
                LocalDate.now()
        );
        testStudent.setStatus(StudentStatus.ACTIVE);
        testStudent = studentRepository.save(testStudent);

    }

    private String getAdminToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "Admin@123", "ADMIN");
        MvcResult res = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).path("accessToken").asText();
    }

    private String getStudentToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student", "Student@123", "STUDENT");
        MvcResult res = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).path("accessToken").asText();
    }

    @Test
    @DisplayName("Security: Unauthorized roles cannot add or remove course prerequisites")
    void testPrerequisiteEndpointsRoleSecurity() throws Exception {
        String studentToken = getStudentToken();
        String adminToken = getAdminToken();

        // 1. Unauthenticated request blocked
        mockMvc.perform(post("/api/v1/courses/" + course201.getId() + "/prerequisites/" + course101.getId()))
                .andExpect(status().isUnauthorized());

        // 2. Student role blocked (403 Forbidden)
        mockMvc.perform(post("/api/v1/courses/" + course201.getId() + "/prerequisites/" + course101.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 3. Admin role succeeds (201 Created)
        mockMvc.perform(post("/api/v1/courses/" + course201.getId() + "/prerequisites/" + course101.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.courseId").value(course201.getId()))
                .andExpect(jsonPath("$.prerequisiteCourseId").value(course101.getId()));

        // 4. Student can view prerequisites (200 OK)
        mockMvc.perform(get("/api/v1/courses/" + course201.getId() + "/prerequisites")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseId").value(course201.getId()))
                .andExpect(jsonPath("$[0].prerequisiteCourseId").value(course101.getId()));

        // 5. Student cannot delete prerequisite (403 Forbidden)
        mockMvc.perform(delete("/api/v1/courses/" + course201.getId() + "/prerequisites/" + course101.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 6. Admin can delete prerequisite (204 No Content)
        mockMvc.perform(delete("/api/v1/courses/" + course201.getId() + "/prerequisites/" + course101.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Workflow: Course registration strictly enforces course prerequisites")
    void testCourseRegistrationPrerequisiteEnforcement() {
        // Prerequisite: CS201 requires CS101
        prerequisiteService.addPrerequisite(course201.getId(), course101.getId());

        // Offering & Section for CS101
        CourseOffering offering101 = offeringRepository.save(CourseOffering.builder()
                .course(course101)
                .semester(semester)
                .maxCapacity(50)
                .isPublished(true)
                .build());

        Section section101 = sectionRepository.save(Section.builder()
                .name("Sec 101-A")
                .courseOffering(offering101)
                .capacity(50)
                .currentEnrollment(0)
                .isActive(true)
                .build());

        // Offering & Section for CS201
        CourseOffering offering201 = offeringRepository.save(CourseOffering.builder()
                .course(course201)
                .semester(semester)
                .maxCapacity(50)
                .isPublished(true)
                .build());

        Section section201 = sectionRepository.save(Section.builder()
                .name("Sec 201-A")
                .courseOffering(offering201)
                .capacity(50)
                .currentEnrollment(0)
                .isActive(true)
                .build());

        // 1. Attempting to register for CS201 without CS101 must fail
        BusinessException ex = assertThrows(BusinessException.class, () ->
                registrationService.registerStudent(testStudent.getId(), offering201.getId(), section201.getId()));

        assertTrue(ex.getMessage().contains("Prerequisite not satisfied"),
                "Expected prerequisite exception, got: " + ex.getMessage());

        // 2. Register for CS101 prerequisite
        CourseRegistration reg101 = registrationService.registerStudent(testStudent.getId(), offering101.getId(), section101.getId());
        assertNotNull(reg101);
        assertEquals(RegistrationStatus.REGISTERED, reg101.getStatus());

        // 3. Now attempt registering for CS201: must succeed!
        CourseRegistration reg201 = registrationService.registerStudent(testStudent.getId(), offering201.getId(), section201.getId());
        assertNotNull(reg201);
        assertEquals(RegistrationStatus.REGISTERED, reg201.getStatus());
    }
}
