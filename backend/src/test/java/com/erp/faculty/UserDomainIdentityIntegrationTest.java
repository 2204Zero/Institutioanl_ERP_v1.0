package com.erp.faculty;

import com.erp.admin.controller.UserController.CreateUserRequest;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.model.UserPrincipal;
import com.erp.auth.repository.UserRepository;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.faculty.service.FacultyIdentityService;
import com.erp.security.SecurityOwnershipService;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserDomainIdentityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyIdentityService facultyIdentityService;

    @Autowired
    private SecurityOwnershipService securityOwnershipService;

    @BeforeEach
    void setup() {
        facultyRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createFaculty_SetsUserIdAndEnforcesIdentity() throws Exception {
        CreateUserRequest req = new CreateUserRequest("profgeller", "Pass@123", "geller@erp.com", "FACULTY", "Ross", "Geller");

        mockMvc.perform(post("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        AppUser user = userRepository.findByUsernameIgnoreCase("profgeller").orElseThrow();
        Faculty faculty = facultyRepository.findByOfficialEmailIgnoreCase("geller@erp.com").orElseThrow();

        // 1. Verify foreign key user_id is set
        assertEquals(user.getId(), faculty.getUserId());

        // 2. Verify lookup by user_id
        Faculty resolvedFaculty = facultyRepository.findByUserId(user.getId()).orElseThrow();
        assertEquals(faculty.getId(), resolvedFaculty.getId());

        // 3. Verify resolution via FacultyIdentityService using principal with ID
        UserPrincipal principal = new UserPrincipal(
                user.getId(), user.getUsername(), user.getPassword(),
                "different-email@erp.com", // Intentionally changed email to test resilience!
                user.getRole(), user.getRole().getPermissions(), true
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Long resolvedId = facultyIdentityService.getCurrentFacultyId();
        assertEquals(faculty.getId(), resolvedId);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createStudentUser_LinksUnambiguousStudentDomainRecord() throws Exception {
        // Pre-create student record
        Student student = new Student(
                "ENR-TEST-99", "Rachel", "Green", "rachel@erp.com",
                "1234567890", LocalDate.of(2000, 1, 1), "FEMALE",
                "Computer Science", "2026 Batch", LocalDate.now()
        );
        student = studentRepository.save(student);
        assertNull(student.getUserId());

        // Create student login account
        CreateUserRequest req = new CreateUserRequest("rgreen", "Pass@123", "rachel@erp.com", "STUDENT", null, null);

        mockMvc.perform(post("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        AppUser user = userRepository.findByUsernameIgnoreCase("rgreen").orElseThrow();
        Student updatedStudent = studentRepository.findById(student.getId()).orElseThrow();

        // Verify linked
        assertEquals(user.getId(), updatedStudent.getUserId());

        // Verify security ownership resolution via user_id
        UserPrincipal studentPrincipal = new UserPrincipal(
                user.getId(), user.getUsername(), user.getPassword(),
                "mutated-email@erp.com", // Intentionally mutated email to prove userId independence
                user.getRole(), user.getRole().getPermissions(), true
        );
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                studentPrincipal, null, studentPrincipal.getAuthorities()
        );

        assertTrue(securityOwnershipService.canAccessStudentData(auth, updatedStudent.getId()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createStudentUser_UnmatchedStudentLeavesUserIdNull() throws Exception {
        CreateUserRequest req = new CreateUserRequest("unmatched_stu", "Pass@123", "nonexistent@erp.com", "STUDENT", null, null);

        mockMvc.perform(post("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        AppUser user = userRepository.findByUsernameIgnoreCase("unmatched_stu").orElseThrow();
        assertFalse(studentRepository.findByUserId(user.getId()).isPresent());
    }

    @Test
    void inMemoryUserPrincipal_WithoutId_FallsBackToEmail() {
        Faculty faculty = Faculty.builder()
                .firstName("Monica")
                .lastName("Geller")
                .officialEmail("monica@erp.com")
                .isActive(true)
                .build();
        faculty = facultyRepository.save(faculty);

        // Principal without ID (null id)
        UserPrincipal principalWithoutId = UserPrincipal.of("monica", "pass", "monica@erp.com", Role.FACULTY);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principalWithoutId, null, principalWithoutId.getAuthorities())
        );

        Long facultyId = facultyIdentityService.getCurrentFacultyId();
        assertEquals(faculty.getId(), facultyId);
    }
}
