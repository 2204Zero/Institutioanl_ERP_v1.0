package com.erp.student.service;

import com.erp.auth.model.UserPrincipal;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class StudentIdentityService {

    private final StudentRepository studentRepository;

    public StudentIdentityService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public Student getCurrentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }

        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            if (!principal.isEnabled()) {
                throw new AccessDeniedException("User account is disabled");
            }
            if (principal.getId() != null) {
                Optional<Student> studentOpt = studentRepository.findByUserId(principal.getId());
                if (studentOpt.isPresent()) {
                    return studentOpt.get();
                }
            }
            if (principal.getEmail() != null) {
                return getStudentForEmail(principal.getEmail());
            }
        }

        String email = authentication.getName();
        return getStudentForEmail(email);
    }

    @Transactional(readOnly = true)
    public Long getCurrentStudentId() {
        return getCurrentStudent().getId();
    }

    @Transactional(readOnly = true)
    public Student getStudentForEmail(String email) {
        if (email == null) {
            throw new ResourceNotFoundException("Student email cannot be null");
        }
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No student record found for email: " + email));
    }
}
