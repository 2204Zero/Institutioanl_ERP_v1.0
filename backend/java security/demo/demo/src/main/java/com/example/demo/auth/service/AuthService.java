package com.example.demo.auth.service;

import com.example.demo.auth.dto.AuthResponse;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.auth.dto.RefreshTokenRequest;
import com.example.demo.auth.dto.SessionResponse;
import com.example.demo.common.exception.InvalidTokenException;
import com.example.demo.security.jwt.JwtProperties;
import com.example.demo.security.jwt.JwtService;
import com.example.demo.session.service.SessionService;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.HashSet;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final SessionService sessionService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       JwtProperties jwtProperties,
                       SessionService sessionService,
                       CustomUserDetailsService userDetailsService,
                       UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.sessionService = sessionService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        User user = userRepository.findByUsername(request.username()).orElseThrow();

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        sessionService.createSession(user.getId(), accessToken, jwtProperties.getAccessTokenExpiration());

        log.info("User {} successfully logged in", userDetails.getUsername());

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtProperties.getAccessTokenExpiration(),
                userDetails.getUsername(),
                user.getRoles().isEmpty() ? "USER" : user.getRoles().iterator().next(),
                user.getRoles()
        );
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (jwtService.isTokenExpired(refreshToken)) {
            throw new InvalidTokenException("Refresh token has expired.");
        }

        String tokenType = jwtService.extractTokenType(refreshToken);
        if (!"REFRESH".equalsIgnoreCase(tokenType)) {
            throw new InvalidTokenException("Provided token is not a valid refresh token.");
        }

        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        User user = userRepository.findByUsername(username).orElseThrow();

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        sessionService.createSession(user.getId(), newAccessToken, jwtProperties.getAccessTokenExpiration());

        log.info("Refreshed access token for user: {}", username);

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                jwtProperties.getAccessTokenExpiration(),
                userDetails.getUsername(),
                user.getRoles().isEmpty() ? "USER" : user.getRoles().iterator().next(),
                user.getRoles()
        );
    }

    public void logout(String bearerToken, String username) {
        if (bearerToken != null && bearerToken.startsWith(jwtProperties.getTokenPrefix())) {
            String token = bearerToken.substring(jwtProperties.getTokenPrefix().length()).trim();
            sessionService.invalidateSession(token);
        }

        if (username != null) {
            userRepository.findByUsername(username).ifPresent(user -> {
                sessionService.invalidateAllUserSessions(user.getId());
            });
            log.info("User {} logged out successfully and sessions invalidated.", username);
        }
    }

    public SessionResponse validateSession(String username, String bearerToken) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        boolean active = false;
        Instant issuedAt = Instant.now();
        Instant expiresAt = Instant.now().plusMillis(jwtProperties.getAccessTokenExpiration());

        if (bearerToken != null && bearerToken.startsWith(jwtProperties.getTokenPrefix())) {
            String token = bearerToken.substring(jwtProperties.getTokenPrefix().length()).trim();
            active = sessionService.validateSession(token);
            if (!jwtService.isTokenExpired(token)) {
                expiresAt = jwtService.extractExpiration(token).toInstant();
            } else {
                active = false;
            }
        }

        return new SessionResponse(
                user.getUsername(),
                user.getRoles().isEmpty() ? "USER" : user.getRoles().iterator().next(),
                user.getRoles(),
                active,
                issuedAt,
                expiresAt,
                active ? "Session is active and valid." : "Session is expired or inactive."
        );
    }
}
