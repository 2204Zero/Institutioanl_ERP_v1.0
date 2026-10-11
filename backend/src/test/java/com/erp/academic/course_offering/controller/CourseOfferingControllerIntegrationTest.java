package com.erp.academic.course_offering.controller;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
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

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CourseOfferingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private SemesterRepository semesterRepo;

    @Autowired
    private CourseOfferingRepository offeringRepo;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Course testCourse;
    private Semester testSemester;
    private CourseOffering testOffering;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DELETE FROM section_student");
        jdbcTemplate.execute("DELETE FROM section_faculty");
        jdbcTemplate.execute("DELETE FROM section");
        jdbcTemplate.execute("DELETE FROM course_offering");

        testCourse = new Course();
        testCourse.setCode("CS301");
        testCourse.setName("Database Management Systems");
        testCourse.setCourseType("THEORY");
        testCourse.setCredits(4);
        testCourse.setIsActive(true);
        testCourse = courseRepo.save(testCourse);

        testSemester = new Semester();
        testSemester.setName("Fall 2026");
        testSemester.setSemesterNumber(5);
        testSemester.setStartDate(LocalDate.of(2026, 8, 1));
        testSemester.setEndDate(LocalDate.of(2026, 12, 15));
        testSemester.setIsActive(true);
        testSemester = semesterRepo.save(testSemester);

        testOffering = CourseOffering.builder()
                .course(testCourse)
                .semester(testSemester)
                .maxCapacity(60)
                .isPublished(true)
                .build();
        testOffering = offeringRepo.save(testOffering);
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    @DisplayName("Finding A: GET /api/v1/course-offerings serializes DTO cleanly without ByteBuddyInterceptor 500 error")
    void testGetAllCourseOfferingsSerializesCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/course-offerings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id", is(testOffering.getId().intValue())))
                .andExpect(jsonPath("$[0].courseId", is(testCourse.getId().intValue())))
                .andExpect(jsonPath("$[0].courseCode", is("CS301")))
                .andExpect(jsonPath("$[0].courseName", is("Database Management Systems")))
                .andExpect(jsonPath("$[0].course.code", is("CS301")))
                .andExpect(jsonPath("$[0].course.name", is("Database Management Systems")))
                .andExpect(jsonPath("$[0].course.credits", is(4)))
                .andExpect(jsonPath("$[0].semesterId", is(testSemester.getId().intValue())))
                .andExpect(jsonPath("$[0].semesterName", is("Fall 2026")))
                .andExpect(jsonPath("$[0].semester.name", is("Fall 2026")))
                .andExpect(jsonPath("$[0].semester.semesterNumber", is(5)))
                .andExpect(jsonPath("$[0].maxCapacity", is(60)))
                .andExpect(jsonPath("$[0].isPublished", is(true)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/course-offerings returns serialized CourseOfferingResponse for ADMIN")
    void testCreateCourseOfferingAsAdmin() throws Exception {
        Course newCourse = new Course();
        newCourse.setCode("CS302");
        newCourse.setName("Operating Systems");
        newCourse.setCourseType("THEORY");
        newCourse.setCredits(4);
        newCourse.setIsActive(true);
        newCourse = courseRepo.save(newCourse);

        String payload = String.format("{\"courseId\": %d, \"semesterId\": %d, \"maxCapacity\": 45}",
                newCourse.getId(), testSemester.getId());

        mockMvc.perform(post("/api/v1/course-offerings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courseCode", is("CS302")))
                .andExpect(jsonPath("$.courseName", is("Operating Systems")))
                .andExpect(jsonPath("$.course.code", is("CS302")))
                .andExpect(jsonPath("$.semesterName", is("Fall 2026")))
                .andExpect(jsonPath("$.maxCapacity", is(45)))
                .andExpect(jsonPath("$.isPublished", is(false)));
    }
}
