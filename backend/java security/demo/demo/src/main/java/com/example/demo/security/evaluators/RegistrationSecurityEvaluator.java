package com.example.demo.security.evaluators;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("registrationSecurity")
public class RegistrationSecurityEvaluator {

    public boolean canModifyRegistration(String targetStudentId) {
        if (targetStudentId == null || targetStudentId.trim().isEmpty()) {
            throw new AccessDeniedException("Invalid student ID.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to modify registration.");
        }

        String currentAuthenticatedUser = authentication.getName();
        if (currentAuthenticatedUser == null || currentAuthenticatedUser.trim().isEmpty()) {
            throw new AccessDeniedException("Invalid principal context.");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isAdmin && !currentAuthenticatedUser.equals(targetStudentId)) {
            throw new AccessDeniedException("IDOR Attempt: You are not authorized to modify registration for another student.");
        }

        return true;
    }
}
