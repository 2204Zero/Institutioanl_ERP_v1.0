# Institutional ERP System - Security Posture Analysis

## Executive Summary
The security architecture contains solid foundational patterns (JWT authentication filter, BCrypt password hashing, Spring Security role hierarchy), but exhibits several security gaps in token lifecycle, OAuth integration, CORS controls, and error exposure.

---

## Security Vulnerabilities & Findings

### 1. Incomplete Token Refresh Lifecycle
- **Issue**: Refresh token rotation is stubbed in the frontend; tokens are stored in `localStorage` rather than `HttpOnly` secure cookies.
- **Impact**: Cross-Site Scripting (XSS) attacks could extract JWT access and refresh tokens.

### 2. Hardcoded Fallbacks & Secret Defaults
- **Issue**: `apiClient.ts` fallback URLs and JWT secret properties rely on default strings if environment variables are omitted.
- **Impact**: Production deployment without explicit secret injection will default to vulnerable signing keys.

### 3. Missing Rate Limiting & Brute-Force Protection
- **Issue**: No rate-limiting filters (Bucket4j or Redis rate limiter) configured on `/api/v1/auth/login`.
- **Impact**: Vulnerable to credential stuffing and brute-force password guessing.

### 4. Overly Permissive CORS Configuration
- **Issue**: CORS allowed origins in backend configuration accept wildcards (`*`) in non-production environments.
- **Impact**: Cross-origin requests from unauthorized domains could interact with exposed endpoints.

### 5. Missing OAuth Identity Providers
- **Issue**: Google, Microsoft, and GitHub OAuth sign-in buttons exist in UI documentation, but backend OAuth2 client configuration is missing.
