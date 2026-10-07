package com.example.demo.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class StudentAccessVerificationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testStudentAccessFlow() throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        
        // 1. Login as student_user
        String loginPayload = "{\"username\":\"student_user\",\"password\":\"password123\"}";
        HttpRequest loginRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(loginPayload))
                .build();

        HttpResponse<String> loginResponse = client.send(loginRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, loginResponse.statusCode(), "Login should succeed");

        JsonNode jsonNode = objectMapper.readTree(loginResponse.body());
        String token = jsonNode.has("accessToken") ? jsonNode.get("accessToken").asText() : null;
        assertNotNull(token, "Access token should not be null");

        // 2. Access Student Profile (/api/auth/me)
        HttpRequest meRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/auth/me"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> meResponse = client.send(meRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, meResponse.statusCode(), "Accessing /api/auth/me should succeed");

        // 3. Attempt to access /api/v1/audit/logs -> Expect 403 Forbidden
        HttpRequest auditRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/v1/audit/logs"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> auditResponse = client.send(auditRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(403, auditResponse.statusCode(), "Accessing audit logs should be forbidden");

        // 4. Attempt IDOR exploit -> Expect 403 Forbidden
        HttpRequest idorRequest = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/v1/students/9999/profile"))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString("{}"))
                .build();
        HttpResponse<String> idorResponse = client.send(idorRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(403, idorResponse.statusCode(), "IDOR exploit should be forbidden");
    }
}
