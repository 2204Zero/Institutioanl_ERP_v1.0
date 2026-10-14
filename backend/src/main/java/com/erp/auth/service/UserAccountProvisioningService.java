package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.BusinessException;
import com.erp.student.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class UserAccountProvisioningService {

    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijkmnopqrstuvwxyz";
    private static final String DIGITS = "23456789";
    private static final String SPECIAL = "!@#$%^&*-_=+";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS + SPECIAL;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public record ProvisionedAccount(AppUser user, String rawPassword, boolean isNewlyCreated) {}

    public UserAccountProvisioningService(UserRepository userRepository,
                                          StudentRepository studentRepository,
                                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Provisions a new student account or links an existing eligible student account.
     * Prevents cross-role collisions and multi-student linking.
     */
    @Transactional
    public ProvisionedAccount provisionOrLinkStudentAccount(String email, String rawPasswordProvided, String preferredUsername) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("Student email is required for account provisioning");
        }
        String normalizedEmail = email.trim().toLowerCase();

        Optional<AppUser> existingUserOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingUserOpt.isPresent()) {
            AppUser existingUser = existingUserOpt.get();
            if (existingUser.getRole() == Role.APPLICANT) {
                throw new BusinessException("Email '" + normalizedEmail + "' is registered as an applicant account. " +
                        "Student ERP accounts must use institutional email.");
            }
            if (existingUser.getRole() != Role.STUDENT) {
                throw new BusinessException("Email '" + normalizedEmail + "' is already registered with role '"
                        + existingUser.getRole() + "'. Cross-role identity mapping is strictly prohibited.");
            }
            Optional<com.erp.student.entity.Student> linkedStudentOpt = studentRepository.findByUserId(existingUser.getId());
            if (linkedStudentOpt.isPresent()) {
                com.erp.student.entity.Student linkedStudent = linkedStudentOpt.get();
                // If previously linked to an entity whose email does not match this account, sever the invalid link
                if (linkedStudent.getEmail() != null && !linkedStudent.getEmail().equalsIgnoreCase(normalizedEmail)) {
                    linkedStudent.setUserId(null);
                    studentRepository.saveAndFlush(linkedStudent);
                } else {
                    throw new BusinessException("User account for email '" + normalizedEmail
                            + "' is already linked to an existing student profile.");
                }
            }
            // Link existing eligible student account
            return new ProvisionedAccount(existingUser, null, false);
        }

        // Provision a new user account
        String rawPassword = (rawPasswordProvided != null && !rawPasswordProvided.isBlank())
                ? rawPasswordProvided.trim()
                : generateSecurePassword();

        String username = determineUniqueUsername(preferredUsername, normalizedEmail, "stu_");
        AppUser newUser = new AppUser(
                username,
                passwordEncoder.encode(rawPassword),
                normalizedEmail,
                Role.STUDENT,
                true
        );
        AppUser savedUser = userRepository.save(newUser);
        return new ProvisionedAccount(savedUser, rawPassword, true);
    }

    /**
     * Provisions a new guardian account or links an existing eligible guardian account.
     * Multiple wards may be associated with the same parent account.
     */
    @Transactional
    public ProvisionedAccount provisionOrLinkGuardianAccount(String email, String rawPasswordProvided, String preferredUsername) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String normalizedEmail = email.trim().toLowerCase();

        Optional<AppUser> existingUserOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingUserOpt.isPresent()) {
            AppUser existingUser = existingUserOpt.get();
            if (existingUser.getRole() != Role.PARENT) {
                throw new BusinessException("Email '" + normalizedEmail + "' is already registered with role '"
                        + existingUser.getRole() + "'. Cannot link as a PARENT/guardian account.");
            }
            // A parent account can represent multiple wards
            return new ProvisionedAccount(existingUser, null, false);
        }

        // Provision a new parent account
        String rawPassword = (rawPasswordProvided != null && !rawPasswordProvided.isBlank())
                ? rawPasswordProvided.trim()
                : generateSecurePassword();

        String username = determineUniqueUsername(preferredUsername, normalizedEmail, "par_");
        AppUser newUser = new AppUser(
                username,
                passwordEncoder.encode(rawPassword),
                normalizedEmail,
                Role.PARENT,
                true
        );
        AppUser savedUser = userRepository.save(newUser);
        return new ProvisionedAccount(savedUser, rawPassword, true);
    }

    public String generateSecurePassword() {
        StringBuilder sb = new StringBuilder(16);
        sb.append(UPPER.charAt(secureRandom.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(secureRandom.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(secureRandom.nextInt(DIGITS.length())));
        sb.append(SPECIAL.charAt(secureRandom.nextInt(SPECIAL.length())));

        for (int i = 4; i < 16; i++) {
            sb.append(ALL_CHARS.charAt(secureRandom.nextInt(ALL_CHARS.length())));
        }

        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = secureRandom.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }

    private String determineUniqueUsername(String preferred, String email, String prefix) {
        if (preferred != null && !preferred.isBlank()) {
            String candidate = preferred.trim().toLowerCase().replaceAll("[^a-z0-9._-]", "");
            if (!candidate.isBlank() && !userRepository.existsByUsernameIgnoreCase(candidate)) {
                return candidate;
            }
        }

        String localPart = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        String sanitizedLocal = localPart.toLowerCase().replaceAll("[^a-z0-9._-]", "");
        if (sanitizedLocal.isBlank()) {
            sanitizedLocal = "user";
        }

        if (!userRepository.existsByUsernameIgnoreCase(sanitizedLocal)) {
            return sanitizedLocal;
        }

        // Append random suffix until unique
        for (int i = 0; i < 100; i++) {
            int suffix = 1000 + secureRandom.nextInt(9000);
            String candidate = sanitizedLocal + "_" + suffix;
            if (!userRepository.existsByUsernameIgnoreCase(candidate)) {
                return candidate;
            }
        }

        return prefix + System.currentTimeMillis();
    }
}
