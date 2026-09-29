# ERP Security Backend - Day 1 to 6 Documentation

## Day 01: Session Management
**What I have done:**
- Implemented `Session` entity with fields for session token, expiration time, and status.
- Created `SessionRepository` to track active sessions by user and token.
- Developed `SessionService` to generate, validate, and revoke sessions (replacing the old in-memory stub).
- Created `SessionController` to expose session operations to administrators.

**Errors encountered:**
- Missing database dependencies and Spring Data JPA.

**How I resolved them:**
- Added `spring-boot-starter-data-jpa` and `h2` to `pom.xml`.
- Configured H2 in `application.properties` with appropriate DDL auto-update flags.

**What I learned:**
- Learned to use a database table for tracking JWT tokens instead of an in-memory token rotation list, which increases scalability and persistence across application restarts.

---

## Day 02: Authentication Testing & Integration
**What I have done:**
- Wrote `AuthenticationIntegrationTest` to verify the authentication workflow.
- Tested valid login, invalid passwords, non-existent usernames, missing tokens, and malformed tokens.
- Tested the logout functionality to ensure tokens are successfully revoked.

**Errors encountered:**
- Encountered a few 401 Unauthorized errors in tests when trying to fetch restricted resources with expired tokens.

**How I resolved them:**
- Adjusted the test suite to fetch the actual token dynamically post-login before injecting it into subsequent requests.

**What I learned:**
- Full integration testing using `@SpringBootTest` and `MockMvc` is essential to verify the complete Spring Security filter chain execution rather than just unit testing service methods.

---

## Day 03: User Management
**What I have done:**
- Implemented the core `User` JPA entity with standard `createdAt` and `updatedAt` audit fields.
- Implemented `UserRepository` and completely removed the legacy `InMemoryUserRegistry`.
- Developed `UserService` with standard CRUD operations, status changes, and unique validation logic.
- Exposed `UserController` endpoints protected by specific permission authorities (`USER_CREATE`, `USER_READ`, `USER_UPDATE`).

**Errors encountered:**
- API exceptions were throwing constructor mismatches (e.g. `ResourceNotFoundException cannot be applied to given types`).

**How I resolved them:**
- Refactored `ApiException` usage across the board to match the defined constructor parameters `(String code, String message, int status)`.

**What I learned:**
- The necessity of carefully managing database identifiers (`snake_case`) while using `camelCase` in Java. `User` entity serves as a foundation for role and session relationships.

---

## Day 04: User–Role Assignment
**What I have done:**
- Created `RoleAssignmentService` to handle dynamic role assignment to `User`.
- Roles are structured within a `Set<String>` using `@ElementCollection` in JPA for a 1-to-many relationship without a dedicated Role table, reducing join overhead.
- Exposed `RoleController` to add/remove roles with `@PreAuthorize("hasAuthority('ROLE_SECURITY_ADMIN')")`.

**Errors encountered:**
- Assigning invalid roles or roles lacking the `ROLE_` prefix caused Spring Security authorization failures.

**How I resolved them:**
- Handled normalizations inside `RoleAssignmentService` by ensuring `ROLE_` prefix is appended if missing.

**What I learned:**
- `@ElementCollection` is highly effective for simple string-based enums/roles instead of setting up a complex ManyToMany setup for basic RBAC systems.

---

## Day 05: Permission Enforcement
**What I have done:**
- Integrated method-level security with `@EnableMethodSecurity`.
- Verified and utilized custom `JwtAuthenticationEntryPoint` and `CustomAccessDeniedHandler`.
- Ensured uniform JSON `ApiErrorResponse` is returned when a user hits a 401 or 403 error.
- Verified that all Controllers use appropriate `@PreAuthorize` annotations.

**Errors encountered:**
- Conflicting `SecurityConfig` beans.

**How I resolved them:**
- Deleted redundant legacy `SecurityConfig` instances and consolidated everything into a single reliable configuration.

**What I learned:**
- Custom handlers at the Spring Security level are crucial so that unauthorized API requests don't return plain-text HTML error pages.

---

## Day 06: Password & Account Recovery
**What I have done:**
- Implemented `PasswordResetToken` entity, repository, and service.
- Implemented change password feature requiring old-password validation via `BCrypt`.
- Implemented a secure forgot-password workflow generating a one-time UUID token that expires in 15 minutes.
- Built `PasswordRecoveryController` for all related operations.

**Errors encountered:**
- Ensuring that tokens cannot be reused after a successful reset.

**How I resolved them:**
- Introduced a `boolean used` flag on the `PasswordResetToken` and explicitly checked it during the reset process to thwart replay attacks.

**What I learned:**
- Never returning plain text passwords in DTOs and keeping reset token lifecycle short and single-use is essential to preventing account takeovers.
