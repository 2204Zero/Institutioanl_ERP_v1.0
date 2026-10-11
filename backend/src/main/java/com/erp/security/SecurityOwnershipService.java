package com.erp.security;

import com.erp.student.repository.StudentRepository;
import com.erp.student.entity.Student;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.student.entity.StudentDocument;
import com.erp.auth.model.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("securityOwnershipService")
public class SecurityOwnershipService {

    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;
    private final StudentDocumentRepository studentDocumentRepository;
    private final com.erp.faculty.service.FacultyIdentityService facultyIdentityService;
    private final com.erp.academic.section.repository.SectionFacultyRepository sectionFacultyRepository;

    public SecurityOwnershipService(StudentRepository studentRepository, 
                                    GuardianRepository guardianRepository,
                                    StudentDocumentRepository studentDocumentRepository,
                                    com.erp.faculty.service.FacultyIdentityService facultyIdentityService,
                                    com.erp.academic.section.repository.SectionFacultyRepository sectionFacultyRepository) {
        this.studentRepository = studentRepository;
        this.guardianRepository = guardianRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.facultyIdentityService = facultyIdentityService;
        this.sectionFacultyRepository = sectionFacultyRepository;
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
            if (authentication.getPrincipal() instanceof UserPrincipal principal && principal.getId() != null) {
                java.util.Optional<Student> studentOpt = studentRepository.findByUserId(principal.getId());
                if (studentOpt.isPresent()) {
                    return studentOpt.get().getId().equals(studentId);
                }
            }
            // Backward-compatible fallback for unlinked legacy student accounts
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

    public boolean canAccessStudentDataByRollNumber(Authentication authentication, String rollNumber) {
        if (authentication == null || rollNumber == null) {
            return false;
        }

        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_FACULTY") || role.equals("ROLE_FINANCE"));

        if (isPrivileged) {
            return true;
        }

        return studentRepository.findByRollNumber(rollNumber)
                .map(student -> canAccessStudentData(authentication, student.getId()))
                .orElse(false);
    }

    public boolean canAccessDocumentData(Authentication authentication, Long documentId) {
        if (authentication == null || documentId == null) {
            return false;
        }

        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_FACULTY"));

        if (isPrivileged) {
            return true;
        }

        return studentDocumentRepository.findById(documentId)
                .map(doc -> doc.getStudent() != null && canAccessStudentData(authentication, doc.getStudent().getId()))
                .orElse(false);
    }

    public boolean canDeleteDocument(Authentication authentication, Long documentId) {
        if (authentication == null || documentId == null) {
            return false;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN"));

        if (isAdmin) {
            return true;
        }

        return studentDocumentRepository.findById(documentId)
                .map(doc -> doc.getStudent() != null && canAccessStudentData(authentication, doc.getStudent().getId()))
                .orElse(false);
    }

    public boolean canAccessGuardianData(Authentication authentication, Long guardianId) {
        if (authentication == null || guardianId == null) {
            return false;
        }

        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN"));

        if (isPrivileged) {
            return true;
        }

        return guardianRepository.findById(guardianId)
                .map(guardian -> {
                    if (guardian.getStudent() != null && canAccessStudentData(authentication, guardian.getStudent().getId())) {
                        return true;
                    }
                    String email = authentication.getName();
                    if (authentication.getPrincipal() instanceof UserPrincipal principal && principal.getEmail() != null) {
                        email = principal.getEmail();
                    }
                    return guardian.getEmail() != null && guardian.getEmail().equalsIgnoreCase(email);
                })
                .orElse(false);
    }

    public boolean canAccessSectionData(Authentication authentication, Long sectionId) {
        if (authentication == null || sectionId == null) {
            return false;
        }

        // 1. Admin/Super Admin/Finance have global access to section data
        boolean isGlobalPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_FINANCE"));

        if (isGlobalPrivileged) {
            return true;
        }

        String email = authentication.getName();
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            if (principal.getEmail() != null) {
                email = principal.getEmail();
            }
        }

        // 2. Faculty Role - Only if assigned to the section
        boolean isFaculty = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_FACULTY"));

        if (isFaculty) {
            try {
                Long facultyId = null;
                if (authentication.getPrincipal() instanceof UserPrincipal principal && principal.getId() != null) {
                    facultyId = facultyIdentityService.getCurrentFacultyId();
                } else {
                    facultyId = facultyIdentityService.getFacultyIdForEmail(email);
                }
                if (facultyId == null) {
                    return false;
                }
                return sectionFacultyRepository.existsBySectionIdAndFacultyId(sectionId, facultyId);
            } catch (com.erp.common.exception.ResourceNotFoundException e) {
                return false;
            }
        }

        // 3. Student/Parent role access - preserve existing behavior if they need access, but typically they don't have access to full section details unless explicitly given.
        // I will return true for student and parent if they are allowed by the current model. Currently in canAccessStudentData they are handled. For section, let's keep it restricted.
        return false;
    }
}