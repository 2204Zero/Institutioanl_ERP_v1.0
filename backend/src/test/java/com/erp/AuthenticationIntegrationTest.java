package com.erp;

import com.erp.auth.dto.ChangePasswordRequest;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.dto.RefreshTokenRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should authenticate successfully with valid credentials and return JWT tokens with RBAC claims")
    void shouldAuthenticateSuccessfullyWithValidCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student", "Student@123", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.username").value("student"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.permissions").isArray());
    }

    @Test
    @DisplayName("Should reject authentication when password is invalid with 401 and standard error payload")
    void shouldRejectAuthenticationWhenPasswordIsInvalid() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student", "WrongPassword!", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    @DisplayName("Should reject authentication when account is disabled")
    void shouldRejectAuthenticationWhenAccountIsDisabled() throws Exception {
        LoginRequest loginRequest = new LoginRequest("disabled_user", "Password@123", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("Should reject authentication when username is nonexistent")
    void shouldRejectAuthenticationWhenUsernameDoesNotExist() throws Exception {
        LoginRequest loginRequest = new LoginRequest("unknown_user_404", "Password@123", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    @DisplayName("Should refresh access token when valid refresh token is supplied")
    void shouldRefreshTokenSuccessfully() throws Exception {
        // 1. Login to get refresh token
        LoginRequest loginRequest = new LoginRequest("faculty", "Faculty@123", null);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = loginJson.get("refreshToken").asText();

        // 2. Perform refresh
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshToken);
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.username").value("faculty"))
                .andExpect(jsonPath("$.role").value("FACULTY"));
    }

    @Test
    @DisplayName("Should validate active session and return session details")
    void shouldValidateActiveSession() throws Exception {
        // Login
        LoginRequest loginRequest = new LoginRequest("student", "Student@123", null);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // Check session
        mockMvc.perform(get("/auth/session")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("student"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("Should invalidate session and revoke token on logout")
    void shouldLogoutAndRevokeToken() throws Exception {
        // 1. Login
        LoginRequest loginRequest = new LoginRequest("student", "Student@123", null);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // 2. Logout
        mockMvc.perform(post("/auth/logout")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());

        // 3. Using the revoked token should now fail with 401 Unauthorized
        mockMvc.perform(get("/api/v1/students/101")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("TOKEN_REVOKED"));
    }

    @Test
    @DisplayName("Should allow SUPER_ADMIN to login when requested role is ADMIN")
    void shouldAllowSuperAdminToLoginViaAdminRole() throws Exception {
        LoginRequest loginRequest = new LoginRequest("superadmin", "Admin@123", "ADMIN");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.username").value("superadmin"))
                .andExpect(jsonPath("$.role").value("SUPER_ADMIN"));
    }

    @Test
    @DisplayName("Should allow authenticated user to change password and login with new password")
    void shouldChangePasswordSuccessfullyAndVerifyLogin() throws Exception {
        // 1. Login with current credentials
        LoginRequest loginRequest = new LoginRequest("faculty", "Faculty@123", null);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        try {
            // 2. Change password
            ChangePasswordRequest changeReq = new ChangePasswordRequest("Faculty@123", "NewFaculty@2026!", "NewFaculty@2026!");
            mockMvc.perform(post("/auth/change-password")
                            .header("Authorization", "Bearer " + accessToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(changeReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password changed successfully. Please use your new password on next login."));

            // 3. Old password must now fail
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest("faculty", "Faculty@123", null))))
                    .andExpect(status().isUnauthorized());

            // 4. New password must now succeed
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest("faculty", "NewFaculty@2026!", null))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.username").value("faculty"));
        } finally {
            // Always restore password back to Faculty@123 so other tests are unaffected
            try {
                MvcResult restoredLoginResult = mockMvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new LoginRequest("faculty", "NewFaculty@2026!", null))))
                        .andReturn();
                if (restoredLoginResult.getResponse().getStatus() == 200) {
                    String restoredToken = objectMapper.readTree(restoredLoginResult.getResponse().getContentAsString()).get("accessToken").asText();
                    mockMvc.perform(post("/auth/change-password")
                                    .header("Authorization", "Bearer " + restoredToken)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(new ChangePasswordRequest("NewFaculty@2026!", "Faculty@123", "Faculty@123"))))
                            .andExpect(status().isOk());
                }
            } catch (Exception ignored) {}
        }
    }

    @Test
    @DisplayName("Should reject password change when current password is wrong")
    void shouldRejectPasswordChangeWhenCurrentPasswordIsWrong() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student", "Student@123", null);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        ChangePasswordRequest changeReq = new ChangePasswordRequest("WrongCurrentPass1!", "NewStudent@2026!", "NewStudent@2026!");
        mockMvc.perform(post("/auth/change-password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }

    @Test
    @DisplayName("Should reject password change when new password does not meet policy")
    void shouldRejectPasswordChangeWhenNewPasswordDoesNotMeetPolicy() throws Exception {
        LoginRequest loginRequest = new LoginRequest("student", "Student@123", null);
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("accessToken").asText();

        // Too weak (no special char, no uppercase)
        ChangePasswordRequest changeReq = new ChangePasswordRequest("Student@123", "simplepass", "simplepass");
        mockMvc.perform(post("/auth/change-password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password must contain at least one uppercase letter"));
    }

    @Test
    @DisplayName("Should reject unauthenticated password change")
    void shouldRejectUnauthenticatedPasswordChange() throws Exception {
        ChangePasswordRequest changeReq = new ChangePasswordRequest("Student@123", "NewPass@12345", "NewPass@12345");
        mockMvc.perform(post("/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().is4xxClientError());
    }
}

