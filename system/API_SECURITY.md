# API Security & Protection Standards

## 1. Security Mitigations
- **SQL Injection Prevention**: Enforced via Spring Data JPA parameterized queries and Hibernate ORM bindings.
- **XSS Protection**: HTML sanitization filters on string inputs and HTTP headers (`X-XSS-Protection: 1; mode=block`).
- **CSRF**: Disabled for stateless REST APIs using Bearer JWT authorization.
- **CORS Policy**: Configured to restrict origin requests strictly to white-listed frontend URLs.
- **Rate Limiting**: Bucket4j rate limiter enforcing 100 requests / minute per IP gateway.
