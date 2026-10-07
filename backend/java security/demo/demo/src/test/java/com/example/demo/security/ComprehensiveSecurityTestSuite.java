package com.example.demo.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class ComprehensiveSecurityTestSuite {

    @Autowired
    private ObjectMapper objectMapper;

    private HttpClient client = HttpClient.newHttpClient();

    private String login(String username, String password) throws Exception {
        String loginPayload = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        HttpRequest loginRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(loginPayload))
                .build();

        HttpResponse<String> response = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 401 || response.statusCode() == 429) {
            return String.valueOf(response.statusCode());
        }
        assertEquals(200, response.statusCode(), "Login failed for " + username);
        JsonNode jsonNode = objectMapper.readTree(response.body());
        return jsonNode.has("accessToken") ? jsonNode.get("accessToken").asText() : null;
    }

    private int sendRequest(String token, String method, String path, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080" + path))
                .header("Authorization", "Bearer " + token);
        
        if (method.equals("GET")) {
            builder.GET();
        } else if (method.equals("POST")) {
            builder.header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body != null ? body : "{}"));
        } else if (method.equals("PUT")) {
            builder.header("Content-Type", "application/json").PUT(HttpRequest.BodyPublishers.ofString(body != null ? body : "{}"));
        } else if (method.equals("DELETE")) {
            builder.DELETE();
        }

        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return response.statusCode();
    }

    @Test
    public void testAuthenticationAndJwtHardening() throws Exception {
        String token = login("admin_user", "password123");
        assertNotNull(token, "Valid token should be returned");
        assertTrue(token.length() > 50, "Token should be a valid JWT");

        String invalidResult = login("admin_user", "wrongpassword");
        assertEquals("401", invalidResult, "Invalid credentials should return 401");

        int status = sendRequest(token + "tampered", "GET", "/api/auth/me", null);
        assertEquals(401, status, "Tampered token should return 401");
    }

    @Test
    public void testRateLimitingProtection() throws Exception {
        int lastStatus = 200;
        for (int i = 0; i < 11; i++) {
            String loginPayload = "{\"username\":\"parent_user\",\"password\":\"password123\"}";
            HttpRequest loginRequest = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:8080/api/auth/login"))
                    .header("Content-Type", "application/json")
                    .header("X-Forwarded-For", "192.168.1.100")
                    .POST(HttpRequest.BodyPublishers.ofString(loginPayload))
                    .build();
            HttpResponse<String> response = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());
            lastStatus = response.statusCode();
        }
        assertEquals(429, lastStatus, "11th request should be rate limited with 429");
    }

    @Test
    public void testRolesAndPermissionsMatrix() throws Exception {
        String superAdminToken = login("super_admin_user", "password123");
        String securityAdminToken = login("security_admin_user", "password123");
        String financeToken = login("finance_user", "password123");
        String facultyToken = login("faculty_user", "password123");
        String studentToken = login("student_user_1", "password123");
        String parentToken = login("parent_user", "password123");

        int saStatus = sendRequest(superAdminToken, "GET", "/api/users", null);
        assertTrue(saStatus != 403, "Super Admin should access");

        int secAdminAudit = sendRequest(securityAdminToken, "GET", "/api/v1/audit/logs", null);
        assertTrue(secAdminAudit != 403, "Security Admin can access audit logs, got " + secAdminAudit);

        int secAdminFinance = sendRequest(securityAdminToken, "GET", "/api/v1/finance/fees", null);
        assertEquals(403, secAdminFinance, "Security Admin cannot access finance");

        // Privilege Escalation Defense -> 403 Forbidden
        // Attempting to assign SUPER_ADMIN to oneself
        String rolePayload = "{\"roleName\": \"SUPER_ADMIN\"}";
        int secAdminEscalation = sendRequest(securityAdminToken, "POST", "/api/users/2/roles", rolePayload); 
        assertEquals(403, secAdminEscalation, "Security Admin cannot assign SUPER_ADMIN role to self");

        int finFinance = sendRequest(financeToken, "GET", "/api/v1/finance/fees", null);
        assertTrue(finFinance != 403, "Finance can access finance endpoints");

        int finAudit = sendRequest(financeToken, "GET", "/api/v1/audit/logs", null);
        assertEquals(403, finAudit, "Finance cannot access audit logs");

        int facAttendance = sendRequest(facultyToken, "GET", "/api/v1/attendance", null);
        assertTrue(facAttendance != 403, "Faculty can access attendance");

        int facFinance = sendRequest(facultyToken, "GET", "/api/v1/finance/fees", null);
        assertEquals(403, facFinance, "Faculty cannot access finance endpoints");

        int studSelf = sendRequest(studentToken, "GET", "/api/v1/students/1", null);
        assertTrue(studSelf != 403, "Student can access own profile");

        int studAttendance = sendRequest(studentToken, "POST", "/api/v1/attendance", null);
        assertEquals(403, studAttendance, "Student cannot mark attendance");
        
        int studAudit = sendRequest(studentToken, "GET", "/api/v1/audit/logs", null);
        assertEquals(403, studAudit, "Student cannot access audit logs");

        int parentWard = sendRequest(parentToken, "GET", "/api/v1/students/1", null);
        assertTrue(parentWard != 403, "Parent can access ward profile");
    }
    
    @Test
    public void testHorizontalIdorDefense() throws Exception {
        String student1Token = login("student_user_1", "password123");
        
        // student_user_1 attempting to update student_user_2's profile
        int idorPut = sendRequest(student1Token, "PUT", "/api/v1/students/2/profile", "{}");
        assertEquals(403, idorPut, "IDOR PUT exploit should be forbidden");
        
        // student_user_1 attempting to access student_user_2's profile
        int idorGet = sendRequest(student1Token, "GET", "/api/v1/students/2", null);
        assertEquals(403, idorGet, "IDOR GET exploit should be forbidden");
    }

    @Test
    public void testAuditLogImmutability() throws Exception {
        String securityAdminToken = login("security_admin_user", "password123");
        
        int deleteAudit = sendRequest(securityAdminToken, "DELETE", "/api/v1/audit/logs/1", null);
        assertEquals(403, deleteAudit, "Audit logs cannot be deleted, got " + deleteAudit);

        int putAudit = sendRequest(securityAdminToken, "PUT", "/api/v1/audit/logs/1", null);
        assertEquals(403, putAudit, "Audit logs cannot be modified, got " + putAudit);
    }
}



