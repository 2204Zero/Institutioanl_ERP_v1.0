package com.erp.admin.controller;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Provisioning FACULTY with firstName and lastName creates linked AppUser and Faculty record")
    void testCreateFacultyUserSuccess() throws Exception {
        UserController.CreateUserRequest request = new UserController.CreateUserRequest(
                "prof_alan",
                "Secure@1234",
                "alan.turing@institution.edu",
                "FACULTY",
                "Alan",
                "Turing"
        );

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", containsString("prof_alan created successfully with role FACULTY")));

        Optional<AppUser> userOpt = userRepository.findByUsernameIgnoreCase("prof_alan");
        assertThat(userOpt).isPresent();
        AppUser savedUser = userOpt.get();
        assertThat(savedUser.getRole()).isEqualTo(Role.FACULTY);
        assertThat(savedUser.getEmail()).isEqualTo("alan.turing@institution.edu");

        Optional<Faculty> facultyOpt = facultyRepository.findByUserId(savedUser.getId());
        assertThat(facultyOpt).isPresent();
        Faculty savedFaculty = facultyOpt.get();
        assertThat(savedFaculty.getFirstName()).isEqualTo("Alan");
        assertThat(savedFaculty.getLastName()).isEqualTo("Turing");
        assertThat(savedFaculty.getOfficialEmail()).isEqualTo("alan.turing@institution.edu");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Provisioning FACULTY without firstName or lastName returns 400 Bad Request with no partial user writes")
    void testCreateFacultyMissingNameReturnsBadRequest() throws Exception {
        UserController.CreateUserRequest request = new UserController.CreateUserRequest(
                "prof_incomplete",
                "Secure@1234",
                "incomplete@institution.edu",
                "FACULTY",
                null,
                ""
        );

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("firstName and lastName are required for FACULTY role")));

        assertThat(userRepository.findByUsernameIgnoreCase("prof_incomplete")).isEmpty();
        assertThat(facultyRepository.existsByOfficialEmailIgnoreCase("incomplete@institution.edu")).isFalse();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Creating user with duplicate username returns 409 Conflict")
    void testCreateUserDuplicateUsernameConflict() throws Exception {
        UserController.CreateUserRequest first = new UserController.CreateUserRequest(
                "unique_user_99",
                "Secure@1234",
                "first@institution.edu",
                "STUDENT",
                null,
                null
        );

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isCreated());

        UserController.CreateUserRequest duplicate = new UserController.CreateUserRequest(
                "unique_user_99",
                "Secure@1234",
                "second@institution.edu",
                "STUDENT",
                null,
                null
        );

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("Username already exists")));
    }

    @Test
    @DisplayName("Unauthenticated request to list users returns 401 Unauthorized")
    void testListUsersUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isUnauthorized());
    }
}
