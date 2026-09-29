# Enterprise Authentication Architecture

## 1. Overview
The Institutional ERP System enforces production-grade JWT-based authentication integrated with Spring Security and OAuth2 providers (Google, Microsoft Azure AD, GitHub).

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant Gateway as Spring Security Auth Gateway
    participant JwtService as JWT Provider Token Engine
    participant DB as PostgreSQL User Database

    User->>Gateway: POST /api/v1/auth/login { username, password, role }
    Gateway->>DB: Validate Username, BCrypt Hash & Account Locks
    DB-->>Gateway: User Authenticated & Authorities Resolved
    Gateway->>JwtService: Issue Signed Access Token (15 min) & Refresh Token (7 Days)
    JwtService-->>User: Return AuthResponse { accessToken, refreshToken, tokenType: "Bearer" }
```

## 2. Supported Features
- **Credentials Login**: BCrypt hashed credentials verification.
- **Refresh Token Rotation**: Automatic token refresh via Axios interceptors.
- **Account Locking**: Account locks after 5 consecutive failed login attempts.
- **Single Sign-On (SSO)**: Google OAuth 2.0, Microsoft Azure AD, and GitHub OAuth integration.
