package com.erp.security;

import com.erp.student.repository.StudentRepository;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.auth.model.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("securityOwnershipService")
public class SecurityOwnershipService {

    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;

    public SecurityOwnershipService(StudentRepository studentRepository, GuardianRepository guardianRepository) {
        this.studentRepository = studentRepository;
        this.guardianRepository = guardianRepository;
    }

    public boolean canAccessStudentData(Authentication authentication, Long studentId) {
        if (authentication == null || studentId == null) {
            return false;
        }

        // 1. Admin/Faculty have global access
        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_FACULTY") || role.equals("ROLE_FINANCE"));

        if (isPrivileged) {
            return true;
        }

        String username = authentication.getName();
        String email = username; // Fallback
        
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            if (principal.getEmail() != null) {
                email = principal.getEmail();
            }
        } else if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
             // In case it's wrapped
        }

        final String userEmail = email;

        // 2. Student Role
        boolean isStudent = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_STUDENT"));

        if (isStudent) {
            return studentRepository.findById(studentId)
                    .map(student -> student.getEmail() != null && student.getEmail().equalsIgnoreCase(userEmail))
                    .orElse(false);
        }

        // 3. Parent Role
        boolean isParent = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_PARENT"));

        if (isParent) {
            List<Guardian> guardians = guardianRepository.findByEmail(userEmail);
            return guardians.stream().anyMatch(g -> g.getStudent() != null && g.getStudent().getId().equals(studentId));
        }

        return false;
    }
}