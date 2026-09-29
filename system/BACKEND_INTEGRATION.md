# Frontend-Backend REST API Integration Blueprint

## 1. Integration Pipeline
The React application communicates with the Spring Boot backend via `ApiClient` (`src/services/apiClient.ts`).

## 2. Request & Response Interceptors
- **Request Interceptor**: Injects `Authorization: Bearer <token>` and `X-Request-ID` headers automatically into all outgoing API calls.
- **Response Interceptor**: Intercepts `401 Unauthorized` responses and executes automatic Token Refresh before retrying failed requests transparently to the user.
