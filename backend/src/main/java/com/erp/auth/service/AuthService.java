package com.erp.auth.service;

import com.erp.auth.dto.AuthResponse;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.dto.RefreshTokenRequest;
import com.erp.auth.dto.SessionResponse;
import com.erp.auth.model.Permission;
import com.erp.auth.model.Role;
import com.erp.auth.model.UserPrincipal;
import com.erp.common.exception.InvalidTokenException;
import com.erp.security.jwt.JwtProperties;
import com.erp.security.jwt.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final SessionService sessionService;
    private final com.erp.auth.repository.UserRepository userRepository;

    public AuthService(CustomUserDetailsService userDetailsService,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       JwtProperties jwtProperties,
                       SessionService sessionService,
                       com.erp.auth.repository.UserRepository userRepository) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.sessionService = sessionService;
        this.userRepository = userRepository;
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        UserPrincipal user;
        try {
            user = (UserPrincipal) userDetailsService.loadUserByUsername(request.username());
        } catch (UsernameNotFoundException e) {
            log.warn("Login failed for username: {}", request.username());
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login failed for username: {}", request.username());
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!user.isEnabled()) {
            log.warn("Login failed for username: {} - account is disabled", request.username());
            throw new org.springframework.security.authentication.DisabledException("User account is disabled");
        }

        if (request.role() != null && !request.role().equalsIgnoreCase(user.getRole().name())) {
            boolean isSuperAdminLoggingAsAdmin = request.role().equalsIgnoreCase("ADMIN") && user.getRole() == Role.SUPER_ADMIN;
            if (!isSuperAdminLoggingAsAdmin) {
                log.warn("Login failed for username: {} - requested role {} does not match actual role {}", request.username(), request.role(), user.getRole().name());
                throw new BadCredentialsException("Unauthorized role access");
            }
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        String tokenId = jwtService.extractTokenId(accessToken);

        // Register active session (Day 05)
        sessionService.registerSession(user.getUsername(), user.getRole().name(), tokenId, clientIp);

        Set<String> permissionNames = user.getPermissions().stream()
                .map(Permission::getValue)
                .collect(Collectors.toSet());

        log.info("User {} successfully logged in with role {}", user.getUsername(), user.getRole());

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtProperties.getAccessTokenExpiration(),
                user.getUsername(),
                user.getRole().name(),
                permissionNames
        );
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (jwtService.isTokenExpired(refreshToken)) {
            throw new InvalidTokenException("Refresh token has expired. Please log in again.");
        }

        String tokenId = jwtService.extractTokenId(refreshToken);
        if (sessionService.isTokenRevoked(tokenId)) {
            throw new InvalidTokenException("Refresh token has been revoked. Please log in again.");
        }

        String tokenType = jwtService.extractTokenType(refreshToken);
        if (!"REFRESH".equalsIgnoreCase(tokenType)) {
            throw new InvalidTokenException("Provided token is not a valid refresh token.");
        }

        String username = jwtService.extractUsername(refreshToken);
        UserPrincipal user;
        try {
            user = (UserPrincipal) userDetailsService.loadUserByUsername(username);
        } catch (UsernameNotFoundException e) {
            throw new UsernameNotFoundException("User associated with refresh token not found.");
        }

        // Revoke the old refresh token (Token rotation policy)
        Date oldExpiry = jwtService.extractExpiration(refreshToken);
        sessionService.revokeToken(tokenId, oldExpiry);

        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        String newTokenId = jwtService.extractTokenId(newAccessToken);

        sessionService.registerSession(user.getUsername(), user.getRole().name(), newTokenId, "REFRESH_ROTATE");

        Set<String> permissionNames = user.getPermissions().stream()
                .map(Permission::getValue)
                .collect(Collectors.toSet());

        log.info("Refreshed access token for user: {}", username);

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                jwtProperties.getAccessTokenExpiration(),
                user.getUsername(),
                user.getRole().name(),
                permissionNames
        );
    }

    public void logout(String bearerToken, String username) {
        if (bearerToken != null && bearerToken.startsWith(jwtProperties.getTokenPrefix())) {
            String token = bearerToken.substring(jwtProperties.getTokenPrefix().length()).trim();
            String tokenId = jwtService.extractTokenId(token);
            Date expiry = jwtService.extractExpiration(token);
            sessionService.revokeToken(tokenId, expiry);
        }

        if (username != null) {
            sessionService.invalidateSession(username);
            log.info("User {} logged out successfully and tokens revoked.", username);
        }
    }

    public SessionResponse validateSession(String username, String bearerToken) {
        UserPrincipal user;
        try {
            user = (UserPrincipal) userDetailsService.loadUserByUsername(username);
        } catch (UsernameNotFoundException e) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        boolean active = sessionService.isSessionValid(username);
        Instant issuedAt = Instant.now();
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getAccessTokenExpiration());

        if (bearerToken != null && bearerToken.startsWith(jwtProperties.getTokenPrefix())) {
            String token = bearerToken.substring(jwtProperties.getTokenPrefix().length()).trim();
            if (jwtService.isTokenExpired(token)) {
                active = false;
            } else {
                expiresAt = jwtService.extractExpiration(token).toInstant();
            }
        }

        Set<String> permissionNames = user.getPermissions().stream()
                .map(Permission::getValue)
                .collect(Collectors.toSet());

        return new SessionResponse(
                user.getUsername(),
                user.getRole().name(),
                permissionNames,
                active,
                issuedAt,
                expiresAt,
                active ? "Session is active and valid." : "Session is expired or inactive."
        );
    }

    @org.springframework.transaction.annotation.Transactional
    public void changePassword(String username, com.erp.auth.dto.ChangePasswordRequest request) {
        if (username == null || username.isBlank()) {
            throw new BadCredentialsException("User is not authenticated");
        }
        if (request.currentPassword() == null || request.currentPassword().isBlank()) {
            throw new IllegalArgumentException("Current password is required");
        }
        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (request.confirmPassword() == null || !request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation password do not match");
        }

        validatePasswordPolicy(request.newPassword());

        com.erp.auth.entity.AppUser user = userRepository.findByUsernameIgnoreCase(username)
                .or(() -> userRepository.findByEmailIgnoreCase(username))
                .orElseThrow(() -> new com.erp.common.exception.ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as your current password");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password successfully changed for user: {}", user.getUsername());
    }

    private void validatePasswordPolicy(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }
}

