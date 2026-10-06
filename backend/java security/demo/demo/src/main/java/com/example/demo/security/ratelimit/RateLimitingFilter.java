package com.example.demo.security.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final InMemoryRateLimiter rateLimiter;

    public RateLimitingFilter(InMemoryRateLimiter rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        if (path != null && path.startsWith("/api/auth/")) {
            String clientIp = getClientIP(request);
            if (!rateLimiter.tryConsume(clientIp)) {
                long retryAfter = rateLimiter.getRetryAfterSeconds(clientIp);
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", String.valueOf(retryAfter));
                response.setContentType("application/json");
                
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                String jsonPayload = String.format(
                    "{\"timestamp\": \"%s\", \"status\": 429, \"code\": \"RATE_LIMIT_EXCEEDED\", \"message\": \"Too many requests. Please try again later.\", \"path\": \"%s\"}",
                    timestamp, path
                );
                response.getWriter().write(jsonPayload);
                return; // short-circuit
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
