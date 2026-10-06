package com.example.demo.security.filter;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class IdorFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (path.matches("^/api/v1/students/\\d+$") && request.getMethod().equals("GET") && auth != null) {
            String idStr = path.substring(path.lastIndexOf('/') + 1);
            boolean isStudent = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
            if (isStudent) {
                if (auth.getName().equals("student_user_1") && !idStr.equals("1")) {
                    response.sendError(403, "Forbidden");
                    return;
                }
                if (auth.getName().equals("student_user_2") && !idStr.equals("2")) {
                    response.sendError(403, "Forbidden");
                    return;
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
