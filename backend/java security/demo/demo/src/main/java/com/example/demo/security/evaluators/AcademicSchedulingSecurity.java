package com.example.demo.security.evaluators;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("schedulingSecurity")
public class AcademicSchedulingSecurity {

    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Prashant
    // MODULE: #34, #35, #36 Academic Scheduling
    // PENDING: Scheduling Controllers
    // ACTION REQUIRED ONCE READY: Annotate scheduling mutation endpoints (timetable, 
    // faculty allocation, classroom allocation) with 
    // @PreAuthorize("@schedulingSecurity.canManageSchedules()").
    // ============================================================================

    public boolean canManageSchedules() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required to manage academic schedules.");
        }

        boolean hasAccess = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ACADEMIC_ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!hasAccess) {
            throw new AccessDeniedException("You do not have permission to manage academic schedules.");
        }

        return true;
    }
}
