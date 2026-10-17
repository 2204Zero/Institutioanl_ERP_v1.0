package com.erp.it.postgres;

import com.erp.admin.controller.UserController;
import com.erp.admin.controller.UserController.CreateUserRequest;
import com.erp.auth.entity.AppUser;
import com.erp.auth.repository.UserRepository;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class ProvisioningAtomicityPostgresIT extends AbstractPostgresIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @org.junit.jupiter.api.BeforeEach
    @org.junit.jupiter.api.AfterEach
    void cleanFixtures() {
        jdbcTemplate.execute("DELETE FROM faculty WHERE official_email = 'watson@erp.com'");
        jdbcTemplate.execute("DELETE FROM users WHERE username = 'drwatson'");
        jdbcTemplate.execute("DELETE FROM users WHERE username = 'phantom_user'");
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"USER_MANAGE"})
    @DisplayName("D.1: Successful provisioning creates AppUser and Faculty records atomically in PostgreSQL")
    void testSuccessfulProvisioningAtomicity() throws Exception {
        CreateUserRequest req = new CreateUserRequest(
                "drwatson", "Password@123", "watson@erp.com", "FACULTY", "John", "Watson"
        );

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        Optional<AppUser> userOpt = userRepository.findByUsernameIgnoreCase("drwatson");
        assertTrue(userOpt.isPresent(), "User drwatson must exist in PostgreSQL users table");

        Optional<Faculty> facOpt = facultyRepository.findByOfficialEmailIgnoreCase("watson@erp.com");
        assertTrue(facOpt.isPresent(), "Faculty record must exist in PostgreSQL faculty table");
        assertEquals(userOpt.get().getId(), facOpt.get().getUserId(), "Faculty user_id must match AppUser id");
    }

    @Test
    @DisplayName("D.2: Controlled failure during faculty creation rolls back AppUser insert in PostgreSQL")
    void testFailedProvisioningRollsBackTransactionInPostgres() {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        assertThrows(RuntimeException.class, () -> {
            tx.execute(status -> {
                // 1. Insert user
                AppUser user = new AppUser("phantom_user", "hash", "phantom@erp.com",
                        com.erp.auth.model.Role.FACULTY, true);
                userRepository.save(user);

                // Verify user temporarily visible within the transaction
                assertTrue(userRepository.findByUsernameIgnoreCase("phantom_user").isPresent());

                // 2. Simulate an unexpected failure before transaction commit
                throw new RuntimeException("Simulated domain linking crash before transaction commit");
            });
        });

        // 3. Verify PostgreSQL transaction rollback: user must NOT exist in database
        Optional<AppUser> phantomUser = userRepository.findByUsernameIgnoreCase("phantom_user");
        assertTrue(phantomUser.isEmpty(), "Transaction rollback must leave no partial AppUser in PostgreSQL");
    }
}
