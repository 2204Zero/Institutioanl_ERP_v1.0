package com.erp.faculty.service;

import com.erp.auth.model.UserPrincipal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import com.erp.common.exception.ResourceNotFoundException;

@Service
public class FacultyIdentityService {

    private final JdbcTemplate jdbcTemplate;

    public FacultyIdentityService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long getFacultyIdForEmail(String email) {
        List<Long> ids = jdbcTemplate.queryForList(
            "SELECT faculty_id FROM faculty WHERE official_email = ?", 
            Long.class, 
            email
        );
        if (ids.isEmpty()) {
            throw new ResourceNotFoundException("No faculty record found for email: " + email);
        }
        return ids.get(0);
    }

    public Long getCurrentFacultyId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }

        String email = null;
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            email = ((UserPrincipal) authentication.getPrincipal()).getEmail();
        } else {
            email = authentication.getName();
        }

        return getFacultyIdForEmail(email);
    }
}
