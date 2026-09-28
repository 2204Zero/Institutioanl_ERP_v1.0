# Enterprise API Test Automation Plan

## 1. Unit & Integration Testing
- **Spring Boot Controller Tests**: `@WebMvcTest` validating request payload formatting, authority checks, and DTO mappings.
- **Service Layer Tests**: `@SpringBootTest` verifying BCrypt password hashes, token rotation, and audit database writes.

## 2. Testing Endpoints
- `POST /api/v1/auth/login` -> Expect `200 OK` with valid JWT token payload.
- `POST /api/v1/auth/refresh` -> Expect `200 OK` with rotated access token.
- `GET /api/v1/sis/students` -> Expect `403 Forbidden` if role authority is insufficient.
