# OAuth2 Single Sign-On Provider Configuration

## 1. Supported Providers
1. **Google OAuth 2.0 Client**: Configured in Spring Boot `application.yml` under `spring.security.oauth2.client.registration.google`.
2. **Microsoft Azure AD**: Enterprise tenant ID & client ID mapping.
3. **GitHub OAuth**: Client credentials for developer sign-in.

## 2. Account Linking Strategy
OAuth logins extract provider email claims and link to existing `Users` records. First-time OAuth users are automatically provisioned default roles (`Student` or `Faculty`).
