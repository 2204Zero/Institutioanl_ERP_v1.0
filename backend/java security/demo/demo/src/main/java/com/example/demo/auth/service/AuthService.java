package com.example.demo.auth.service;

import com.example.demo.auth.dto.AuthResponse;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.auth.dto.RefreshTokenRequest;
import com.example.demo.auth.dto.SessionResponse;
import com.example.demo.auth.model.InMemoryUserRegistry;
import com.example.demo.auth.model.Permission;
import com.example.demo.auth.model.UserPrincipal;
import com.example.demo.common.exception.InvalidTokenException;
import com.example.demo.security.jwt.JwtProperties;
import com.example.demo.security.jwt.JwtService;
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

    private final InMemoryUserRegistry userRegistry;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final SessionService sessionService;

    public AuthService(InMemoryUserRegistry userRegistry,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       JwtProperties jwtProperties,
                       SessionService sessionService) {
        this.userRegistry = userRegistry;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.sessionService = sessionService;
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        UserPrincipal user = userRegistry.findByUsername(request.username());
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login failed for username: {}", request.username());
            throw new BadCredentialsException("Invalid username or password");
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
        UserPrincipal user = userRegistry.findByUsername(username);
        if (user == null) {
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
        UserPrincipal user = userRegistry.findByUsername(username);
        if (user == null) {
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
}
