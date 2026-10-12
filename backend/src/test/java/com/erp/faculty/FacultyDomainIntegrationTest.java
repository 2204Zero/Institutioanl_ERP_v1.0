package com.erp.faculty;

import com.erp.admin.controller.UserController.CreateUserRequest;
import com.erp.auth.entity.AppUser;
import com.erp.auth.repository.UserRepository;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FacultyDomainIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        facultyRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createFacultyAccount_CreatesDomainRecord() throws Exception {
        CreateUserRequest req = new CreateUserRequest("drsmith", "Pass@123", "smith@erp.com", "FACULTY", "John", "Smith");

        mockMvc.perform(post("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated());

        // Verify AppUser
        assertTrue(userRepository.existsByUsernameIgnoreCase("drsmith"));

        // Verify Faculty domain record
        Faculty faculty = facultyRepository.findByOfficialEmailIgnoreCase("smith@erp.com").orElse(null);
        assertNotNull(faculty);
        assertEquals("John", faculty.getFirstName());
        assertEquals("Smith", faculty.getLastName());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createNonFacultyAccount_DoesNotCreateDomainRecord() throws Exception {
        CreateUserRequest req = new CreateUserRequest("librarian", "Pass@123", "lib@erp.com", "FINANCE", null, null);

        mockMvc.perform(post("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated());

        assertTrue(userRepository.existsByUsernameIgnoreCase("librarian"));
        assertFalse(facultyRepository.existsByOfficialEmailIgnoreCase("lib@erp.com"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createFaculty_DuplicateEmail_Rejects() throws Exception {
        facultyRepository.save(Faculty.builder().firstName("A").lastName("B").officialEmail("duplicate@erp.com").build());

        CreateUserRequest req = new CreateUserRequest("newdr", "Pass@123", "duplicate@erp.com", "FACULTY", "John", "Doe");

        mockMvc.perform(post("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAdminFaculty_ReturnsDomainRecords() throws Exception {
        facultyRepository.save(Faculty.builder().firstName("A").lastName("B").officialEmail("f1@erp.com").build());

        mockMvc.perform(get("/api/v1/admin/faculty"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].email").value("f1@erp.com"))
            .andExpect(jsonPath("$[0].firstName").value("A"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void assignFaculty_InvalidFacultyId_ThrowsNotFound() throws Exception {
        com.erp.academic.section.dto.SectionFacultyAssignRequest req = new com.erp.academic.section.dto.SectionFacultyAssignRequest();
        req.setFacultyId(99999L);
        req.setRole("PRIMARY");

        mockMvc.perform(post("/api/v1/sections/1/faculty")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isNotFound());
    }
}
