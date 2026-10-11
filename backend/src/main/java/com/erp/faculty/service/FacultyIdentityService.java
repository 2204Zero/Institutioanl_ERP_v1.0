package com.erp.faculty.service;

import com.erp.auth.model.UserPrincipal;
import com.erp.faculty.entity.Faculty;
import com.erp.faculty.repository.FacultyRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import com.erp.common.exception.ResourceNotFoundException;

@Service
public class FacultyIdentityService {

    private final FacultyRepository facultyRepository;

    public FacultyIdentityService(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public Long getFacultyIdForEmail(String email) {
        return facultyRepository.findByOfficialEmailIgnoreCase(email)
                .map(Faculty::getId)
                .orElseThrow(() -> new ResourceNotFoundException("No faculty record found for email: " + email));
    }

    @Transactional(readOnly = true)
    public Long getFacultyIdForUserId(Long userId) {
        if (userId == null) {
            throw new ResourceNotFoundException("User ID cannot be null");
        }
        return facultyRepository.findByUserId(userId)
                .map(Faculty::getId)
                .orElseThrow(() -> new ResourceNotFoundException("No faculty record found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public Long getCurrentFacultyId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }

        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            if (principal.getId() != null) {
                Optional<Faculty> facultyOpt = facultyRepository.findByUserId(principal.getId());
                if (facultyOpt.isPresent()) {
                    return facultyOpt.get().getId();
                }
            }
            // Explicit backward-compatible fallback for unlinked legacy accounts
            if (principal.getEmail() != null) {
                return getFacultyIdForEmail(principal.getEmail());
            }
        }

        String email = authentication.getName();
        return getFacultyIdForEmail(email);
    }
}
