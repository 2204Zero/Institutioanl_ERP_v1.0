package com.example.demo.security.evaluators;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("registrationSecurity")
public class RegistrationSecurityEvaluator {

    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Palak
    // MODULE: #33 Registration Holds
    // PENDING: RegistrationHoldService implementation
    // ACTION REQUIRED ONCE READY: Inject RegistrationHoldService and call 
    // holdService.hasActiveHold(targetStudentId) before allowing registration.
    // ============================================================================
    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Prashant
    // MODULE: #21 Academic Calendar
    // PENDING: AcademicCalendarService implementation
    // ACTION REQUIRED ONCE READY: Inject AcademicCalendarService to verify that the 
    // registration window is currently active for the semester.
    // ============================================================================

    public boolean canModifyRegistration(String targetStudentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to modify registration.");
        }

        String currentAuthenticatedUser = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !currentAuthenticatedUser.equals(targetStudentId)) {
            throw new AccessDeniedException("IDOR Attempt: You are not authorized to modify registration for another student.");
        }

        return true;
    }
}
