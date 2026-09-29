package com.example.demo.security.jwt;

import com.example.demo.session.service.SessionService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserDetailsService userDetailsService;
    private final SessionService sessionService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   JwtProperties jwtProperties,
                                   UserDetailsService userDetailsService,
                                   SessionService sessionService) {
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.userDetailsService = userDetailsService;
        this.sessionService = sessionService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/auth/login") ||
               path.equals("/api/password/forgot") ||
               path.equals("/api/password/reset") ||
               path.equals("/auth/refresh") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger-ui");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(jwtProperties.getHeaderString());

        if (authHeader == null || !authHeader.startsWith(jwtProperties.getTokenPrefix())) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(jwtProperties.getTokenPrefix().length()).trim();

        try {
            if (!sessionService.validateSession(jwt)) {
                log.warn("Rejected request with invalid or revoked token.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE);
                com.example.demo.common.exception.ApiErrorResponse errorResponse = com.example.demo.common.exception.ApiErrorResponse.of(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "TOKEN_INVALID_OR_REVOKED",
                        "Token is invalid, expired, or revoked. Please log in again.",
                        request.getRequestURI()
                );
                response.getWriter().write(new com.fasterxml.jackson.databind.ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule()).writeValueAsString(errorResponse));
                return;
            }

            final String username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("Authenticated user {} with authorities: {}", username, userDetails.getAuthorities());
                }
            }
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token has expired: {}", ex.getMessage());
            request.setAttribute("auth_error_code", "TOKEN_EXPIRED");
            request.setAttribute("auth_error_message", "JWT access token has expired. Please refresh your token.");
        } catch (SignatureException ex) {
            log.warn("Invalid JWT signature: {}", ex.getMessage());
            request.setAttribute("auth_error_code", "INVALID_TOKEN_SIGNATURE");
            request.setAttribute("auth_error_message", "JWT token signature is invalid.");
        } catch (Exception ex) {
            log.warn("JWT processing failed: {}", ex.getMessage());
            request.setAttribute("auth_error_code", "INVALID_TOKEN");
            request.setAttribute("auth_error_message", "Authentication token is invalid: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
