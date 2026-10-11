package com.erp.academic.section.controller;

import com.erp.academic.section.entity.Section;
import com.erp.academic.section.entity.SectionFaculty;
import com.erp.academic.section.entity.SectionStudent;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.repository.SectionFacultyRepository;
import com.erp.academic.section.repository.SectionStudentRepository;
import com.erp.faculty.service.FacultyIdentityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SectionSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SectionRepository sectionRepo;

    @Autowired
    private SectionFacultyRepository sectionFacultyRepo;

    @Autowired
    private SectionStudentRepository sectionStudentRepo;

    @MockBean
    private FacultyIdentityService facultyIdentityService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private com.erp.academic.course_offering.repository.CourseOfferingRepository courseOfferingRepo;

    private Long facultyA_Id = 100L;
    private Long facultyB_Id = 200L;
    private Section mySection;
    private Section otherSection;
    private com.erp.academic.course_offering.entity.CourseOffering offering;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("DELETE FROM section_faculty");
        jdbcTemplate.execute("DELETE FROM section_student");
        jdbcTemplate.execute("DELETE FROM section");
        jdbcTemplate.execute("DELETE FROM course_offering");
        jdbcTemplate.execute("DELETE FROM course");
        jdbcTemplate.execute("DELETE FROM faculty");

        // Insert dummy course, semester and offering
        jdbcTemplate.execute("INSERT INTO course (id, code, name, department_id, credits, is_active) VALUES (999, 'SEC101', 'Security', 1, 3, true)");
        jdbcTemplate.execute("INSERT INTO semester (id, name, is_active) VALUES (999, 'Spring 2026', true)");
        jdbcTemplate.execute("INSERT INTO course_offering (id, course_id, semester_id, max_capacity, is_published) VALUES (999, 999, 999, 60, true)");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email) VALUES (100, 'Test', 'FacultyA', 'testfacA@erp.com')");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email) VALUES (200, 'Test', 'FacultyB', 'testfacB@erp.com')");
        jdbcTemplate.execute("INSERT INTO faculty (faculty_id, first_name, last_name, official_email) VALUES (300, 'Test', 'FacultyC', 'testfacC@erp.com')");

        offering = courseOfferingRepo.findById(999L).orElse(null);

        mySection = sectionRepo.save(Section.builder()
                .name("Section A")
                .courseOffering(offering)
                .capacity(60)
                .currentEnrollment(10)
                .isActive(true)
                .build());

        otherSection = sectionRepo.save(Section.builder()
                .name("Section B")
                .courseOffering(offering)
                .capacity(60)
                .currentEnrollment(10)
                .isActive(true)
                .build());

        sectionFacultyRepo.save(SectionFaculty.builder()
                .sectionId(mySection.getId())
                .facultyId(facultyA_Id)
                .role("PRIMARY")
                .build());

        sectionFacultyRepo.save(SectionFaculty.builder()
                .sectionId(otherSection.getId())
                .facultyId(facultyB_Id)
                .role("PRIMARY")
                .build());
    }

    @Test
    @WithMockUser(username = "facultyA@erp.com", roles = {"FACULTY"})
    void SEC_SECTION_01_facultyAccessOwnSection() throws Exception {
        when(facultyIdentityService.getFacultyIdForEmail("facultyA@erp.com")).thenReturn(facultyA_Id);

        mockMvc.perform(get("/api/v1/sections/" + mySection.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "facultyA@erp.com", roles = {"FACULTY"})
    void SEC_SECTION_02_facultyAccessOtherSection() throws Exception {
        when(facultyIdentityService.getFacultyIdForEmail("facultyA@erp.com")).thenReturn(facultyA_Id);

        mockMvc.perform(get("/api/v1/sections/" + otherSection.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "facultyA@erp.com", roles = {"FACULTY"})
    void SEC_ROSTER_01_facultyAccessOwnRoster() throws Exception {
        when(facultyIdentityService.getFacultyIdForEmail("facultyA@erp.com")).thenReturn(facultyA_Id);

        mockMvc.perform(get("/api/v1/sections/" + mySection.getId() + "/students"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "facultyA@erp.com", roles = {"FACULTY"})
    void SEC_ROSTER_02_facultyAccessOtherRoster() throws Exception {
        when(facultyIdentityService.getFacultyIdForEmail("facultyA@erp.com")).thenReturn(facultyA_Id);

        mockMvc.perform(get("/api/v1/sections/" + otherSection.getId() + "/students"))
                .andExpect(status().isForbidden());
    }

    @Test
    void SEC_SECTION_03_unauthenticatedSectionRequest() throws Exception {
        mockMvc.perform(get("/api/v1/sections/" + mySection.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SEC_ROSTER_03_unauthenticatedRosterRequest() throws Exception {
        mockMvc.perform(get("/api/v1/sections/" + mySection.getId() + "/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    void SEC_SECTION_04_adminAccessAnySection() throws Exception {
        mockMvc.perform(get("/api/v1/sections/" + otherSection.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    void SEC_SECTION_05_studentAccessRestricted() throws Exception {
        mockMvc.perform(get("/api/v1/sections/" + mySection.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "facultyA@erp.com", roles = {"FACULTY"})
    void SEC_SECTION_06_facultyAccessMultipleAssignedSections() throws Exception {
        Section anotherSection = sectionRepo.save(Section.builder()
                .name("Section C")
                .courseOffering(offering)
                .capacity(60)
                .isActive(true)
                .build());
        sectionFacultyRepo.save(SectionFaculty.builder()
                .sectionId(anotherSection.getId())
                .facultyId(facultyA_Id)
                .role("SECONDARY")
                .build());

        when(facultyIdentityService.getFacultyIdForEmail("facultyA@erp.com")).thenReturn(facultyA_Id);

        mockMvc.perform(get("/api/v1/sections/" + mySection.getId()))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/sections/" + anotherSection.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "facultyC@erp.com", roles = {"FACULTY"})
    void IDOR_ENUMERATION_TEST() throws Exception {
        Long facultyC_Id = 300L;
        when(facultyIdentityService.getFacultyIdForEmail("facultyC@erp.com")).thenReturn(facultyC_Id);
        
        Section section1 = sectionRepo.save(Section.builder().name("T1").courseOffering(offering).capacity(60).isActive(true).build());
        Section section2 = sectionRepo.save(Section.builder().name("T2").courseOffering(offering).capacity(60).isActive(true).build());
        Section section3 = sectionRepo.save(Section.builder().name("T3").courseOffering(offering).capacity(60).isActive(true).build());
        
        mockMvc.perform(get("/api/v1/sections/" + section1.getId())).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/sections/" + section2.getId())).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/sections/" + section3.getId())).andExpect(status().isForbidden());
    }

    @Test
    void SEC_MUTATION_01_unauthenticatedCreateSection() throws Exception {
        mockMvc.perform(post("/api/v1/sections")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"courseOfferingId\":999,\"capacity\":30}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student@erp.com", roles = {"STUDENT"})
    void SEC_MUTATION_02_studentForbiddenCreateSection() throws Exception {
        mockMvc.perform(post("/api/v1/sections")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"courseOfferingId\":999,\"capacity\":30}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    void SEC_MUTATION_03_adminCanCreateSection() throws Exception {
        mockMvc.perform(post("/api/v1/sections")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"courseOfferingId\":999,\"capacity\":30}"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "superadmin@erp.com", roles = {"SUPER_ADMIN"})
    void SEC_MUTATION_04_superAdminCanCreateSection() throws Exception {
        mockMvc.perform(post("/api/v1/sections")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"courseOfferingId\":999,\"capacity\":30}"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "facultyA@erp.com", roles = {"FACULTY"})
    void SEC_MUTATION_05_facultyForbiddenAssignFaculty() throws Exception {
        mockMvc.perform(post("/api/v1/sections/" + mySection.getId() + "/faculty")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"facultyId\":100,\"role\":\"CLASS_TEACHER\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@erp.com", roles = {"ADMIN"})
    void SEC_MUTATION_06_adminCanAssignFaculty() throws Exception {
        mockMvc.perform(post("/api/v1/sections/" + mySection.getId() + "/faculty")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"facultyId\":300,\"role\":\"CLASS_TEACHER\"}"))
                .andExpect(status().isCreated());
    }
}
