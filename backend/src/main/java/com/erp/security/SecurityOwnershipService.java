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
    private final com.erp.academic.section.repository.SectionStudentRepository sectionStudentRepository;
    private final com.erp.admission.application.repository.AdmissionApplicationRepository admissionApplicationRepository;

    public SecurityOwnershipService(StudentRepository studentRepository, 
                                    GuardianRepository guardianRepository,
                                    StudentDocumentRepository studentDocumentRepository,
                                    com.erp.faculty.service.FacultyIdentityService facultyIdentityService,
                                    com.erp.academic.section.repository.SectionFacultyRepository sectionFacultyRepository,
                                    com.erp.academic.section.repository.SectionStudentRepository sectionStudentRepository,
                                    com.erp.admission.application.repository.AdmissionApplicationRepository admissionApplicationRepository) {
        this.studentRepository = studentRepository;
        this.guardianRepository = guardianRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.facultyIdentityService = facultyIdentityService;
        this.sectionFacultyRepository = sectionFacultyRepository;
        this.sectionStudentRepository = sectionStudentRepository;
        this.admissionApplicationRepository = admissionApplicationRepository;
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

    /**
     * Dedicated authorization check for sensitive student finance records.
     * Restricts access strictly to ADMIN, SUPER_ADMIN, FINANCE, and the specific STUDENT themselves.
     * FACULTY and unverified PARENTS are explicitly denied access to student financial debt/records.
     */
    public boolean canAccessStudentFinance(Authentication authentication, Long studentId) {
        if (authentication == null || studentId == null) {
            return false;
        }

        // 1. Privileged Roles: ADMIN, SUPER_ADMIN, FINANCE (FACULTY is excluded from financial records)
        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_FINANCE"));

        if (isPrivileged) {
            return true;
        }

        // 2. Student Role: allowed strictly for their own record
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
            String email = authentication.getName();
            if (authentication.getPrincipal() instanceof UserPrincipal principal && principal.getEmail() != null) {
                email = principal.getEmail();
            }
            final String userEmail = email;
            return studentRepository.findById(studentId)
                    .map(student -> student.getEmail() != null && student.getEmail().equalsIgnoreCase(userEmail))
                    .orElse(false);
        }

        // 3. Faculty, Parents, and other roles are denied
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
            Long facultyId = resolveFacultyId(authentication, email);
            if (facultyId == null || facultyId == 0L) {
                return false;
            }
            return sectionFacultyRepository.existsBySectionIdAndFacultyId(sectionId, facultyId);
        }

        return false;
    }

    public Long resolveFacultyId(Authentication authentication, String email) {
        if (authentication == null) {
            return null;
        }
        try {
            if (authentication.getPrincipal() instanceof UserPrincipal principal && principal.getId() != null) {
                try {
                    return facultyIdentityService.getCurrentFacultyId();
                } catch (Exception ignored) {
                    return null;
                }
            } else {
                try {
                    Long fid = facultyIdentityService.getFacultyIdForEmail(email);
                    if (fid != null && fid > 0L) {
                        return fid;
                    }
                } catch (Exception ignored) {}
                try {
                    return facultyIdentityService.getCurrentFacultyId();
                } catch (Exception ignored) {
                    return null;
                }
            }
        } catch (Exception e) {
            return null;
        }
    }

    public boolean canAccessStudentAttendance(Authentication authentication, Long studentId) {
        if (authentication == null || studentId == null) {
            return false;
        }

        // 1. Admin/Super Admin have global institutional access
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN"));

        if (isAdmin) {
            return true;
        }

        String email = authentication.getName();
        if (authentication.getPrincipal() instanceof UserPrincipal principal && principal.getEmail() != null) {
            email = principal.getEmail();
        }
        final String userEmail = email;

        // 2. Student Role - can view only their own attendance
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
            return studentRepository.findById(studentId)
                    .map(student -> student.getEmail() != null && student.getEmail().equalsIgnoreCase(userEmail))
                    .orElse(false);
        }

        // 3. Parent Role - can view only linked student's attendance
        boolean isParent = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_PARENT"));

        if (isParent) {
            List<Guardian> guardians = guardianRepository.findByEmail(userEmail);
            return guardians.stream().anyMatch(g -> g.getStudent() != null && g.getStudent().getId().equals(studentId));
        }

        // 4. Faculty Role - can view only students enrolled in sections assigned to this faculty
        boolean isFaculty = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_FACULTY"));

        if (isFaculty) {
            Long facultyId = resolveFacultyId(authentication, userEmail);
            if (facultyId == null || facultyId == 0L) {
                return false;
            }
            List<com.erp.academic.section.entity.SectionFaculty> assignments = sectionFacultyRepository.findByFacultyId(facultyId);
            if (assignments == null || assignments.isEmpty()) {
                return false;
            }
            for (com.erp.academic.section.entity.SectionFaculty sf : assignments) {
                if (sectionStudentRepository.existsBySectionIdAndStudentIdAndIsActiveTrue(sf.getSectionId(), studentId)) {
                    return true;
                }
            }
            return false;
        }

        return false;
    }

    public boolean canAccessApplicant(Authentication authentication, Long applicantId) {
        if (authentication == null || applicantId == null) {
            return false;
        }

        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN"));

        if (isPrivileged) {
            return true;
        }

        boolean isStudent = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_STUDENT"));

        if (isStudent) {
            // In the current modular monolith schema, Applicant is not linked to AppUser or Student (no user_id).
            // Per Phase 9.18 safety specification:
            // Do not infer applicant ownership from matching names or arbitrary caller-supplied IDs.
            // If no trustworthy relationship exists between the authenticated account and an applicant,
            // reject unlinked student accounts safely until a persistent applicant identity relationship is provisioned.
            return false;
        }

        return false;
    }

    public boolean canAccessAdmissionApplication(Authentication authentication, Long applicationId) {
        if (authentication == null || applicationId == null) {
            return false;
        }

        boolean isPrivileged = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN"));

        if (isPrivileged) {
            return true;
        }

        boolean isStudent = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_STUDENT"));

        if (isStudent) {
            return admissionApplicationRepository.findById(applicationId)
                    .map(app -> app.getApplicant() != null && canAccessApplicant(authentication, app.getApplicant().getId()))
                    .orElse(false);
        }

        return false;
    }
}