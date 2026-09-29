package com.erp.security.jwt;

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
    private final com.erp.auth.service.SessionService sessionService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   JwtProperties jwtProperties,
                                   UserDetailsService userDetailsService,
                                   com.erp.auth.service.SessionService sessionService) {
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
            final String username = jwtService.extractUsername(jwt);
            final String tokenId = jwtService.extractTokenId(jwt);

            if (sessionService.isTokenRevoked(tokenId)) {
                log.warn("JWT token has been revoked for token ID: {}", tokenId);
                request.setAttribute("auth_error_code", "TOKEN_REVOKED");
                request.setAttribute("auth_error_message", "JWT token has been revoked.");
                filterChain.doFilter(request, response);
                return;
            }

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
