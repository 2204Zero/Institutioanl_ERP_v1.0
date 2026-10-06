package com.example.demo.security.evaluators;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("admissionsSecurity")
public class AdmissionsSecurityEvaluator {

    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Palak
    // MODULE: #11 Application Review, #12 Document Verification
    // PENDING: ApplicationRepository and ApplicationService
    // ACTION REQUIRED ONCE READY: Inject ApplicationService to validate that the 
    // application state is SUBMITTED before it can transition to UNDER_REVIEW.
    // ============================================================================
    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Singhal
    // MODULE: #12 Document Verification
    // PENDING: MinIO secure signed URL access checks
    // ACTION REQUIRED ONCE READY: Add logic to authorize access to uploaded documents.
    // ============================================================================

    public boolean canReviewApplication(String applicationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to review applications.");
        }

        boolean hasAccess = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMISSION_OFFICER") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!hasAccess) {
            throw new AccessDeniedException("You do not have permission to review this application.");
        }

        return true;
    }
}
