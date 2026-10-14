package com.erp.auth.service;

import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProvisioningCredentialDisclosureService {

    private final StudentRepository studentRepository;
    private final GuardianRepository guardianRepository;
    private final org.springframework.beans.factory.ObjectProvider<com.erp.admission.applicant.repository.ApplicantRepository> applicantRepositoryProvider;
    private final org.springframework.beans.factory.ObjectProvider<com.erp.admission.application.repository.AdmissionApplicationRepository> admissionApplicationRepositoryProvider;
    private final org.springframework.beans.factory.ObjectProvider<com.erp.auth.repository.UserRepository> userRepositoryProvider;

    public record AccountAccessSummary(
            Long applicationId,
            Long studentId,
            String studentEnrollmentNumber,
            String studentLoginIdentifier,
            String studentEmail,
            String studentStatus,
            boolean studentOneTimeSecretAvailable,
            String guardianName,
            String guardianRelation,
            String guardianLoginIdentifier,
            String guardianEmail,
            String guardianStatus,
            boolean guardianOneTimeSecretAvailable
    ) {}

    public record DisclosedCredentials(
            Long applicationId,
            String studentLoginIdentifier,
            String studentTemporaryPassword,
            String guardianLoginIdentifier,
            String guardianTemporaryPassword,
            boolean alreadyConsumed,
            String message
    ) {}

    private static class TransientDisclosure {
        final Long applicationId;
        final Long applicantId;
        final Long studentId;
        final String studentEnrollmentNumber;
        final String studentLoginIdentifier;
        final String studentEmail;
        final String studentTemporaryPassword;
        final String studentStatus;
        final String guardianName;
        final String guardianRelation;
        final String guardianLoginIdentifier;
        final String guardianEmail;
        final String guardianTemporaryPassword;
        final String guardianStatus;
        final Instant createdAt;
        volatile boolean consumed;

        TransientDisclosure(Long applicationId, Long applicantId, Long studentId, String studentEnrollmentNumber,
                            String studentLoginIdentifier, String studentEmail, String studentTemporaryPassword, String studentStatus,
                            String guardianName, String guardianRelation, String guardianLoginIdentifier, String guardianEmail,
                            String guardianTemporaryPassword, String guardianStatus) {
            this.applicationId = applicationId;
            this.applicantId = applicantId;
            this.studentId = studentId;
            this.studentEnrollmentNumber = studentEnrollmentNumber;
            this.studentLoginIdentifier = studentLoginIdentifier;
            this.studentEmail = studentEmail;
            this.studentTemporaryPassword = studentTemporaryPassword;
            this.studentStatus = studentStatus != null ? studentStatus : "PROVISIONED";
            this.guardianName = guardianName;
            this.guardianRelation = guardianRelation;
            this.guardianLoginIdentifier = guardianLoginIdentifier;
            this.guardianEmail = guardianEmail;
            this.guardianTemporaryPassword = guardianTemporaryPassword;
            this.guardianStatus = guardianStatus != null ? guardianStatus : "PROVISIONED";
            this.createdAt = Instant.now();
            this.consumed = false;
        }
    }

    private final Map<Long, TransientDisclosure> disclosures = new ConcurrentHashMap<>();

    public void registerDisclosure(Long applicationId, Long applicantId, Long studentId, String studentEnrollmentNumber,
                                   String studentLoginIdentifier, String studentEmail, String studentTemporaryPassword,
                                   String guardianName, String guardianRelation, String guardianLoginIdentifier,
                                   String guardianEmail, String guardianTemporaryPassword) {
        TransientDisclosure td = new TransientDisclosure(
                applicationId, applicantId, studentId, studentEnrollmentNumber,
                studentLoginIdentifier, studentEmail, studentTemporaryPassword, "ACTIVE",
                guardianName, guardianRelation, guardianLoginIdentifier, guardianEmail,
                guardianTemporaryPassword, "ACTIVE"
        );
        disclosures.put(applicationId, td);
    }

    public AccountAccessSummary getSummary(Long applicationId, Long applicantId, String applicantEmail) {
        TransientDisclosure td = disclosures.get(applicationId);
        if (td != null && td.applicantId.equals(applicantId)) {
            return new AccountAccessSummary(
                    td.applicationId,
                    td.studentId,
                    td.studentEnrollmentNumber,
                    td.studentLoginIdentifier,
                    td.studentEmail,
                    td.studentStatus,
                    !td.consumed && td.studentTemporaryPassword != null,
                    td.guardianName,
                    td.guardianRelation,
                    td.guardianLoginIdentifier,
                    td.guardianEmail,
                    td.guardianStatus,
                    !td.consumed && td.guardianTemporaryPassword != null
            );
        }

        // Fallback for previously enrolled students / after restart
        if (studentRepository != null) {
            com.erp.admission.applicant.entity.Applicant applicant = null;
            if (applicantRepositoryProvider != null && applicantRepositoryProvider.getIfAvailable() != null) {
                if (applicantId != null) {
                    applicant = applicantRepositoryProvider.getIfAvailable().findById(applicantId).orElse(null);
                }
                if (applicant == null && applicantEmail != null) {
                    applicant = applicantRepositoryProvider.getIfAvailable().findByEmail(applicantEmail).orElse(null);
                }
            }
            if (applicant == null && applicationId != null && admissionApplicationRepositoryProvider != null && admissionApplicationRepositoryProvider.getIfAvailable() != null) {
                var appOpt = admissionApplicationRepositoryProvider.getIfAvailable().findById(applicationId);
                if (appOpt.isPresent()) {
                    applicant = appOpt.get().getApplicant();
                }
            }

            final String appPhone = (applicant != null && applicant.getPhone() != null) ? applicant.getPhone() : null;
            final String appFirst = (applicant != null && applicant.getFirstName() != null) ? applicant.getFirstName() : null;
            final String appLast = (applicant != null && applicant.getLastName() != null) ? applicant.getLastName() : null;

            var studentOpt = studentRepository.findAll().stream()
                    .filter(s -> {
                        if (applicantEmail != null && s.getEmail() != null) {
                            if (s.getEmail().equalsIgnoreCase(applicantEmail)) return true;
                            String prefix = applicantEmail.split("@")[0].toLowerCase();
                            String baseName = prefix.replaceAll("([._]?[0-9]+)+$", "");
                            if (!baseName.isBlank() && s.getEmail().toLowerCase().startsWith(baseName)) {
                                return true;
                            }
                            String studentUser = s.getEmail().split("@")[0].toLowerCase();
                            if (!studentUser.isBlank() && prefix.contains(studentUser)) {
                                return true;
                            }
                        }
                        if (appPhone != null && !appPhone.isBlank() && !"0000000000".equals(appPhone) && appPhone.equals(s.getPhone())) {
                            return true;
                        }
                        if (appFirst != null && appLast != null && s.getFirstName() != null && s.getLastName() != null) {
                            if (appFirst.equalsIgnoreCase(s.getFirstName()) && appLast.equalsIgnoreCase(s.getLastName())) {
                                return true;
                            }
                            if (appFirst.toLowerCase().contains(s.getFirstName().toLowerCase()) && !s.getFirstName().isBlank()) {
                                return true;
                            }
                        }
                        return false;
                    })
                    .findFirst();

            if (studentOpt.isEmpty() && applicantEmail != null && applicantRepositoryProvider != null && applicantRepositoryProvider.getIfAvailable() != null) {
                var otherApplicants = applicantRepositoryProvider.getIfAvailable().findAll().stream()
                        .filter(a -> applicantEmail.equalsIgnoreCase(a.getEmail()))
                        .toList();
                for (var other : otherApplicants) {
                    if (other.getPhone() != null && !other.getPhone().isBlank() && !"0000000000".equals(other.getPhone())) {
                        studentOpt = studentRepository.findAll().stream()
                                .filter(s -> other.getPhone().equals(s.getPhone()))
                                .findFirst();
                        if (studentOpt.isPresent()) break;
                    }
                    if (other.getFirstName() != null && other.getLastName() != null) {
                        studentOpt = studentRepository.findAll().stream()
                                .filter(s -> other.getFirstName().equalsIgnoreCase(s.getFirstName()) && other.getLastName().equalsIgnoreCase(s.getLastName()))
                                .findFirst();
                        if (studentOpt.isPresent()) break;
                    }
                }
            }

            if (studentOpt.isEmpty() && guardianRepository != null && applicantEmail != null) {
                String emailPrefix = applicantEmail.contains("@") ? applicantEmail.substring(0, applicantEmail.indexOf("@")) : "";
                String[] parts = emailPrefix.split("\\.");
                if (parts.length >= 3) {
                    String marker = parts[parts.length - 2] + "." + parts[parts.length - 1];
                    for (Guardian g : guardianRepository.findAll()) {
                        if (g.getEmail() != null && g.getEmail().contains(marker) && g.getStudent() != null) {
                            studentOpt = java.util.Optional.of(g.getStudent());
                            break;
                        }
                    }
                }
            }

            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                String studentUsername = s.getUsername();
                if (studentUsername == null && s.getUserId() != null && userRepositoryProvider != null && userRepositoryProvider.getIfAvailable() != null) {
                    studentUsername = userRepositoryProvider.getIfAvailable().findById(s.getUserId())
                            .map(com.erp.auth.entity.AppUser::getUsername)
                            .orElse(null);
                }
                if (studentUsername == null) {
                    studentUsername = s.getEnrollmentNumber() != null ? s.getEnrollmentNumber() : s.getEmail();
                }

                String gName = null;
                String gRel = null;
                String gLogin = null;
                String gEmail = null;

                if (guardianRepository != null) {
                    List<Guardian> gList = guardianRepository.findByStudentId(s.getId());
                    if (!gList.isEmpty()) {
                        Guardian g = gList.get(0);
                        gName = (g.getFirstName() + " " + g.getLastName()).trim();
                        gRel = g.getRelation();
                        if (g.getUserId() != null && userRepositoryProvider != null && userRepositoryProvider.getIfAvailable() != null) {
                            gLogin = userRepositoryProvider.getIfAvailable().findById(g.getUserId())
                                    .map(com.erp.auth.entity.AppUser::getUsername)
                                    .orElse(null);
                        }
                        if (gLogin == null) {
                            gLogin = g.getUsername() != null ? g.getUsername() : g.getEmail();
                        }
                        gEmail = g.getEmail();
                    }
                }

                return new AccountAccessSummary(
                        applicationId,
                        s.getId(),
                        s.getEnrollmentNumber(),
                        studentUsername,
                        s.getEmail(),
                        "ACTIVE",
                        false,
                        gName,
                        gRel,
                        gLogin,
                        gEmail,
                        gLogin != null ? "ACTIVE" : "NOT_CONFIGURED",
                        false
                );
            }
        }

        return null;
    }

    public DisclosedCredentials disclose(Long applicationId, Long applicantId) {
        TransientDisclosure td = disclosures.get(applicationId);
        if (td == null || !td.applicantId.equals(applicantId)) {
            AccountAccessSummary summary = getSummary(applicationId, applicantId, null);
            String stuLogin = summary != null ? summary.studentLoginIdentifier() : null;
            String parLogin = summary != null ? summary.guardianLoginIdentifier() : null;
            return new DisclosedCredentials(
                    applicationId, stuLogin, null, parLogin, null, true,
                    "No initial temporary passwords available for disclosure. Use Password Reset on the login page."
            );
        }

        synchronized (td) {
            if (td.consumed) {
                return new DisclosedCredentials(
                        applicationId,
                        td.studentLoginIdentifier,
                        null,
                        td.guardianLoginIdentifier,
                        null,
                        true,
                        "Initial credentials were already disclosed. If you need new credentials, use Password Reset."
                );
            }

            td.consumed = true;
            return new DisclosedCredentials(
                    applicationId,
                    td.studentLoginIdentifier,
                    td.studentTemporaryPassword,
                    td.guardianLoginIdentifier,
                    td.guardianTemporaryPassword,
                    false,
                    "Credentials successfully disclosed. Please record and secure these credentials immediately."
            );
        }
    }
}
