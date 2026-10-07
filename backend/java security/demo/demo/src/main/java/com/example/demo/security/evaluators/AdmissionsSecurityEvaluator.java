package com.example.demo.security.evaluators;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("admissionsSecurity")
public class AdmissionsSecurityEvaluator {

    public boolean canReviewApplication(String applicationId) {
        if (applicationId == null || applicationId.trim().isEmpty()) {
            throw new AccessDeniedException("Invalid application ID.");
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to review applications.");
        }

        boolean hasAccess = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMISSION_OFFICER") || a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!hasAccess) {
            throw new AccessDeniedException("You do not have permission to review this application.");
        }

        return true;
    }
}
