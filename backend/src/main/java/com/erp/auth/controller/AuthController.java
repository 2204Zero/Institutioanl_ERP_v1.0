package com.erp.auth.controller;

import com.erp.auth.dto.AuthResponse;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.dto.RefreshTokenRequest;
import com.erp.auth.dto.SessionResponse;
import com.erp.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication & Session", description = "Endpoints for user authentication, token refresh, logout, and session validation")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT tokens", description = "Validates credentials and generates access & refresh tokens with RBAC claims")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        AuthResponse response = authService.login(request, clientIp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Uses a valid refresh token to issue a new access token with token rotation")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate session", description = "Revokes the active JWT token and clears user session state")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        authService.logout(bearerToken, username);
        return ResponseEntity.ok(Map.of("message", "User logged out successfully. Session invalidated."));
    }

    @GetMapping("/session")
    @Operation(summary = "Validate active session", description = "Verifies active session status and token validity for current user")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<SessionResponse> validateSession(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        SessionResponse response = authService.validateSession(username, bearerToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns username and granted authorities from security context")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of(
                "username", auth.getName(),
                "authorities", auth.getAuthorities().stream().map(Object::toString).toList(),
                "authenticated", auth.isAuthenticated()
        ));
    }
}

