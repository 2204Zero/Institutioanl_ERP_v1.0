package com.erp.auth.service;

import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private static final String DISCLOSURES_FILE = "provisioning_disclosures.json";

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
            boolean guardianOneTimeSecretAvailable,
            String studentTemporaryPassword,
            String guardianTemporaryPassword
    ) {
        public AccountAccessSummary(
                Long applicationId, Long studentId, String studentEnrollmentNumber, String studentLoginIdentifier,
                String studentEmail, String studentStatus, boolean studentOneTimeSecretAvailable,
                String guardianName, String guardianRelation, String guardianLoginIdentifier,
                String guardianEmail, String guardianStatus, boolean guardianOneTimeSecretAvailable) {
            this(applicationId, studentId, studentEnrollmentNumber, studentLoginIdentifier, studentEmail, studentStatus,
                 studentOneTimeSecretAvailable, guardianName, guardianRelation, guardianLoginIdentifier, guardianEmail,
                 guardianStatus, guardianOneTimeSecretAvailable, null, null);
        }
    }

    public record DisclosedCredentials(
            Long applicationId,
            String studentLoginIdentifier,
            String studentTemporaryPassword,
            String guardianLoginIdentifier,
            String guardianTemporaryPassword,
            boolean alreadyConsumed,
            String message
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TransientDisclosure {
        public Long applicationId;
        public Long applicantId;
        public Long studentId;
        public String studentEnrollmentNumber;
        public String studentLoginIdentifier;
        public String studentEmail;
        public String studentTemporaryPassword;
        public String studentStatus;
        public String guardianName;
        public String guardianRelation;
        public String guardianLoginIdentifier;
        public String guardianEmail;
        public String guardianTemporaryPassword;
        public String guardianStatus;
        public Instant createdAt;
        public volatile boolean consumed;

        public TransientDisclosure() {}

        public TransientDisclosure(Long applicationId, Long applicantId, Long studentId, String studentEnrollmentNumber,
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

    private Path getStorageFilePath() {
        try {
            Path devJsonPath = Paths.get("data", "dev-json");
            if (Files.exists(devJsonPath)) {
                return devJsonPath.resolve(DISCLOSURES_FILE);
            }
            Path backendDevJson = Paths.get("backend", "data", "dev-json");
            if (Files.exists(backendDevJson)) {
                return backendDevJson.resolve(DISCLOSURES_FILE);
            }
        } catch (Exception ignored) {}
        return Paths.get(DISCLOSURES_FILE).toAbsolutePath().normalize();
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        loadDisclosuresFromDisk();
    }

    private synchronized void loadDisclosuresFromDisk() {
        try {
            Path file = getStorageFilePath();
            if (Files.exists(file)) {
                List<TransientDisclosure> list = objectMapper.readValue(
                        file.toFile(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TransientDisclosure.class)
                );
                if (list != null) {
                    for (TransientDisclosure td : list) {
                        if (td.applicationId != null) {
                            disclosures.put(td.applicationId, td);
                        }
                    }
                    log.info("Loaded {} provisioning disclosures from {}", disclosures.size(), file);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load provisioning disclosures from disk: {}", e.getMessage());
        }
    }

    private synchronized void persistDisclosuresToDisk() {
        try {
            Path file = getStorageFilePath();
            if (file.getParent() != null && !Files.exists(file.getParent())) {
                Files.createDirectories(file.getParent());
            }
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), new ArrayList<>(disclosures.values()));
        } catch (Exception e) {
            log.warn("Failed to persist provisioning disclosures to disk: {}", e.getMessage());
        }
    }

    public boolean isPasswordStillTemporary(String usernameOrEmail, String temporaryPassword) {
        if (temporaryPassword == null || temporaryPassword.isBlank()) {
            return false;
        }
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return false;
        }
        if (userRepositoryProvider == null || userRepositoryProvider.getIfAvailable() == null) {
            return true;
        }
        var userOpt = userRepositoryProvider.getIfAvailable().findByUsernameIgnoreCase(usernameOrEmail)
                .or(() -> userRepositoryProvider.getIfAvailable().findByEmailIgnoreCase(usernameOrEmail));
        if (userOpt.isEmpty()) {
            return false;
        }
        var user = userOpt.get();
        if (user.getPassword() == null) {
            return false;
        }
        return passwordEncoder.matches(temporaryPassword, user.getPassword());
    }

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
        persistDisclosuresToDisk();
    }

    public AccountAccessSummary getSummary(Long applicationId, Long applicantId, String applicantEmail) {
        TransientDisclosure td = disclosures.get(applicationId);
        if (td != null && td.applicantId.equals(applicantId)) {
            boolean stuStillTemp = isPasswordStillTemporary(td.studentLoginIdentifier, td.studentTemporaryPassword);
            boolean gStillTemp = isPasswordStillTemporary(td.guardianLoginIdentifier, td.guardianTemporaryPassword);

            return new AccountAccessSummary(
                    td.applicationId,
                    td.studentId,
                    td.studentEnrollmentNumber,
                    td.studentLoginIdentifier,
                    td.studentEmail,
                    td.studentStatus,
                    stuStillTemp,
                    td.guardianName,
                    td.guardianRelation,
                    td.guardianLoginIdentifier,
                    td.guardianEmail,
                    td.guardianStatus,
                    gStillTemp,
                    stuStillTemp ? td.studentTemporaryPassword : null,
                    gStillTemp ? td.guardianTemporaryPassword : null
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

                // Check if any matching disclosure exists for this student
                TransientDisclosure matchedTd = disclosures.values().stream()
                        .filter(d -> (d.studentId != null && d.studentId.equals(s.getId()))
                                || (d.studentEnrollmentNumber != null && d.studentEnrollmentNumber.equalsIgnoreCase(s.getEnrollmentNumber())))
                        .findFirst()
                        .orElse(null);

                boolean stuStillTemp = false;
                boolean gStillTemp = false;
                String stuPass = null;
                String gPass = null;

                if (matchedTd != null) {
                    stuStillTemp = isPasswordStillTemporary(studentUsername, matchedTd.studentTemporaryPassword);
                    gStillTemp = isPasswordStillTemporary(gLogin, matchedTd.guardianTemporaryPassword);
                    stuPass = stuStillTemp ? matchedTd.studentTemporaryPassword : null;
                    gPass = gStillTemp ? matchedTd.guardianTemporaryPassword : null;
                }

                return new AccountAccessSummary(
                        applicationId,
                        s.getId(),
                        s.getEnrollmentNumber(),
                        studentUsername,
                        s.getEmail(),
                        "ACTIVE",
                        stuStillTemp,
                        gName,
                        gRel,
                        gLogin,
                        gEmail,
                        gLogin != null ? "ACTIVE" : "NOT_CONFIGURED",
                        gStillTemp,
                        stuPass,
                        gPass
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
            String stuPass = summary != null ? summary.studentTemporaryPassword() : null;
            String parPass = summary != null ? summary.guardianTemporaryPassword() : null;
            boolean available = (stuPass != null || parPass != null);
            return new DisclosedCredentials(
                    applicationId, stuLogin, stuPass, parLogin, parPass, !available,
                    available ? "Credentials successfully disclosed. Available until changed."
                              : "No initial temporary passwords available for disclosure. Use Password Reset on the login page."
            );
        }

        synchronized (td) {
            boolean stuStillTemp = isPasswordStillTemporary(td.studentLoginIdentifier, td.studentTemporaryPassword);
            boolean gStillTemp = isPasswordStillTemporary(td.guardianLoginIdentifier, td.guardianTemporaryPassword);

            String stuPass = stuStillTemp ? td.studentTemporaryPassword : null;
            String parPass = gStillTemp ? td.guardianTemporaryPassword : null;
            boolean allChanged = !stuStillTemp && !gStillTemp;

            td.consumed = allChanged;
            persistDisclosuresToDisk();

            return new DisclosedCredentials(
                    applicationId,
                    td.studentLoginIdentifier,
                    stuPass,
                    td.guardianLoginIdentifier,
                    parPass,
                    allChanged,
                    allChanged ? "Password has already been changed by user."
                               : "Initial credentials revealed. You may use this temporary password until changed."
            );
        }
    }
}
