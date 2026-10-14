package com.erp.admission.controller;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.admission.applicant.dto.ApplicantDto;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.applicant.service.ApplicantService;
import com.erp.admission.application.dto.AdmissionApplicationDto;
import com.erp.admission.application.service.AdmissionApplicationService;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ValidationException;
import com.erp.devjson.notification.JsonNotificationDataStoreManager;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.erp.admission.inquiry.entity.AdmissionInquiry;
import com.erp.student.entity.Student;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/admissions/public")
public class PublicAdmissionController {

    private final ApplicantService applicantService;
    private final ApplicantRepository applicantRepository;
    private final AdmissionApplicationService applicationService;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;
    private final UserRepository userRepository;
    private final JsonNotificationDataStoreManager notificationManager;
    private final com.erp.admission.document.service.DocumentVerificationService documentVerificationService;
    private final com.erp.admission.inquiry.repository.AdmissionInquiryRepository inquiryRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.erp.student.repository.StudentRepository studentRepository;
    private final com.erp.auth.service.ProvisioningCredentialDisclosureService credentialDisclosureService;

    @Autowired
    public PublicAdmissionController(
            ApplicantService applicantService,
            ApplicantRepository applicantRepository,
            AdmissionApplicationService applicationService,
            ProgramRepository programRepository,
            AcademicYearRepository academicYearRepository,
            UserRepository userRepository,
            @Autowired(required = false) JsonNotificationDataStoreManager notificationManager,
            com.erp.admission.document.service.DocumentVerificationService documentVerificationService,
            com.erp.admission.inquiry.repository.AdmissionInquiryRepository inquiryRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            com.erp.student.repository.StudentRepository studentRepository,
            @Autowired(required = false) com.erp.auth.service.ProvisioningCredentialDisclosureService credentialDisclosureService) {
        this.applicantService = applicantService;
        this.applicantRepository = applicantRepository;
        this.applicationService = applicationService;
        this.programRepository = programRepository;
        this.academicYearRepository = academicYearRepository;
        this.userRepository = userRepository;
        this.notificationManager = notificationManager;
        this.documentVerificationService = documentVerificationService;
        this.inquiryRepository = inquiryRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRepository = studentRepository;
        this.credentialDisclosureService = credentialDisclosureService;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PublicInquiryRequest(
            @JsonAlias({"applicantName", "name", "prospectName"})
            String prospectName,
            @JsonAlias({"applicantEmail"})
            String email,
            String phone,
            @JsonAlias({"programOfInterest", "programId"})
            String programOfInterest,
            @JsonAlias({"message", "notes"})
            String notes
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PublicApplicationRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            LocalDate dateOfBirth,
            String gender,
            String address,
            @NotNull Long programId,
            @NotNull Long academicYearId,
            String remarks
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PublicRegisterRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            @NotBlank String phone,
            @NotBlank String password,
            LocalDate dateOfBirth,
            String gender,
            String address
    ) {}

    public record ApplicantDashboardResponse(
            ApplicantDto applicant,
            String username,
            List<AdmissionApplicationDto> applications,
            List<com.erp.admission.inquiry.entity.AdmissionInquiry> inquiries,
            boolean isEnrolled,
            String enrollmentNumber,
            Long studentId,
            com.erp.auth.service.ProvisioningCredentialDisclosureService.AccountAccessSummary accountAccess
    ) {
        public ApplicantDashboardResponse(
                ApplicantDto applicant,
                String username,
                List<AdmissionApplicationDto> applications,
                List<com.erp.admission.inquiry.entity.AdmissionInquiry> inquiries,
                boolean isEnrolled,
                String enrollmentNumber,
                Long studentId) {
            this(applicant, username, applications, inquiries, isEnrolled, enrollmentNumber, studentId, null);
        }
    }

    public record PublicProgramDto(Long id, String name, String code, String degree, Integer duration) {}
    public record PublicAcademicYearDto(Long id, String name, LocalDate startDate, LocalDate endDate, Boolean isActive) {}

    private void notifyAdmins(String title, String message, String link) {
        if (notificationManager != null && userRepository != null) {
            try {
                List<com.erp.auth.entity.AppUser> admins = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.SUPER_ADMIN)
                        .toList();
                for (com.erp.auth.entity.AppUser admin : admins) {
                    notificationManager.createNotification(
                            admin.getId(),
                            title,
                            message,
                            "ADMISSION",
                            link
                    );
                }
            } catch (Exception ignored) {}
        }
    }

    public Applicant resolveApplicantFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String principalName = authentication.getName();
        com.erp.auth.entity.AppUser user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmailIgnoreCase(principalName))
                .orElse(null);

        Applicant applicant = null;
        if (user != null && user.getId() != null) {
            applicant = applicantRepository.findByUserId(user.getId())
                    .or(() -> applicantRepository.findByEmail(user.getEmail()))
                    .orElse(null);
        }
        if (applicant == null) {
            applicant = applicantRepository.findByEmail(principalName).orElse(null);
        }
        if (applicant == null && user != null) {
            String email = (user.getEmail() != null && !user.getEmail().isBlank()) ? user.getEmail().trim().toLowerCase() : principalName.trim().toLowerCase();
            String name = user.getUsername() != null ? user.getUsername() : "Applicant";
            Applicant newApp = Applicant.builder()
                    .firstName(name)
                    .lastName("Applicant")
                    .email(email)
                    .phone("0000000000")
                    .gender("OTHER")
                    .dateOfBirth(LocalDate.now().minusYears(18))
                    .userId(user.getId())
                    .build();
            applicant = applicantRepository.save(newApp);
        }
        return applicant;
    }

    @GetMapping("/programs")
    public ResponseEntity<List<PublicProgramDto>> getPublicPrograms() {
        List<PublicProgramDto> list = programRepository.findAll().stream()
                .filter(p -> p.getIsActive() == null || p.getIsActive())
                .map(p -> new PublicProgramDto(p.getId(), p.getName(), p.getCode(), p.getDegree(), p.getDuration()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/academic-years")
    public ResponseEntity<List<PublicAcademicYearDto>> getPublicAcademicYears() {
        List<PublicAcademicYearDto> list = academicYearRepository.findAll().stream()
                .map(ay -> new PublicAcademicYearDto(ay.getId(), ay.getName(), ay.getStartDate(), ay.getEndDate(), ay.getIsActive()))
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/inquiries")
    public ResponseEntity<?> submitInquiry(
            @jakarta.validation.Valid @RequestBody PublicInquiryRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required to submit an inquiry. Please sign in or create an account."));
        }

        Applicant applicant = resolveApplicantFromAuthentication(authentication);
        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Applicant profile not found for authenticated user."));
        }

        String fullName = applicant.getFirstName() + (applicant.getLastName() != null && !applicant.getLastName().isBlank() ? " " + applicant.getLastName() : "");
        String cleanEmail = applicant.getEmail();
        String cleanPhone = applicant.getPhone();

        AdmissionInquiry inq = AdmissionInquiry.builder()
                .prospectName(fullName)
                .email(cleanEmail)
                .phone(cleanPhone)
                .programOfInterest(request.programOfInterest())
                .status("NEW")
                .notes(request.notes())
                .build();
        AdmissionInquiry saved = inquiryRepository.save(inq);

        notifyAdmins(
                "New Admissions Inquiry",
                "Prospective applicant " + fullName + " submitted an inquiry" + (request.programOfInterest() != null ? " for " + request.programOfInterest() : "") + ".",
                "/dashboard/admissions?tab=inquiries"
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("referenceNumber", "INQ-" + saved.getId());
        resp.put("prospectName", saved.getProspectName());
        resp.put("email", saved.getEmail());
        resp.put("phone", saved.getPhone());
        resp.put("programOfInterest", saved.getProgramOfInterest());
        resp.put("status", saved.getStatus());
        resp.put("notes", saved.getNotes());
        resp.put("createdAt", saved.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(
            @jakarta.validation.Valid @RequestBody PublicApplicationRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required to submit an application. Please sign in or create an account."));
        }

        Applicant applicant = resolveApplicantFromAuthentication(authentication);
        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Applicant profile not found for authenticated user."));
        }

        boolean modified = false;
        if (request.dateOfBirth() != null) {
            applicant.setDateOfBirth(request.dateOfBirth());
            modified = true;
        }
        if (request.gender() != null && !request.gender().isBlank()) {
            applicant.setGender(request.gender());
            modified = true;
        }
        if (request.address() != null && !request.address().isBlank()) {
            applicant.setAddress(request.address());
            modified = true;
        }
        if (modified) {
            applicantRepository.save(applicant);
        }

        // Check if an application already exists for this applicant, program, and academic year
        List<AdmissionApplicationDto> existingApps = applicationService.getApplicationsByApplicant(applicant.getId());
        Optional<AdmissionApplicationDto> match = existingApps.stream()
                .filter(a -> a.getProgramId().equals(request.programId()) && a.getAcademicYearId().equals(request.academicYearId()))
                .findFirst();

        if (match.isPresent()) {
            return ResponseEntity.ok(match.get());
        }

        AdmissionApplicationDto draft = applicationService.createDraftApplication(
                applicant.getId(),
                request.programId(),
                request.academicYearId()
        );

        AdmissionApplicationDto submitted = applicationService.submitApplication(draft.getId());

        notifyAdmins(
                "New Application: " + submitted.getApplicationNumber(),
                "Formal application submitted by " + applicant.getFirstName() + " " + applicant.getLastName() + ".",
                "/dashboard/admissions?tab=applications"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }

    @PostMapping(value = "/applications/{applicationId}/documents", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadApplicationDocument(
            @PathVariable Long applicationId,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required."));
        }

        AdmissionApplicationDto app = applicationService.getApplication(applicationId);
        if (app == null) {
            throw new com.erp.common.exception.ResourceNotFoundException("Application not found with id: " + applicationId);
        }

        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!isStaff) {
            Applicant applicant = resolveApplicantFromAuthentication(authentication);
            if (applicant == null || !applicant.getId().equals(app.getApplicantId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You are not authorized to upload documents for this application."));
            }
        }

        var doc = documentVerificationService.uploadDocumentFile(app.getApplicantId(), documentType, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerApplicant(
            @jakarta.validation.Valid @RequestBody PublicRegisterRequest request) {

        String cleanEmail = request.email().trim().toLowerCase();
        String cleanPhone = request.phone().trim();
        String rawPassword = request.password().trim();

        if (rawPassword.length() < 6) {
            throw new ValidationException("Password must be at least 6 characters in length.");
        }

        // Check if an AppUser already exists with this email or username
        if (userRepository.findByEmailIgnoreCase(cleanEmail).isPresent() ||
            userRepository.findByUsername(cleanEmail).isPresent()) {
            throw new ValidationException("An account with email '" + cleanEmail + "' is already registered. Please sign in.");
        }

        // Check if phone is already registered under a different applicant
        Optional<Applicant> existingByPhone = applicantRepository.findByPhone(cleanPhone);
        if (existingByPhone.isPresent() && !existingByPhone.get().getEmail().equalsIgnoreCase(cleanEmail)) {
            throw new ValidationException("The contact phone number '" + cleanPhone + "' is already registered under another applicant. Please provide a different phone number.");
        }

        // Create or load applicant
        Applicant applicant = applicantRepository.findByEmail(cleanEmail)
                .orElseGet(() -> {
                    Applicant newApp = Applicant.builder()
                            .firstName(request.firstName().trim())
                            .lastName(request.lastName().trim())
                            .email(cleanEmail)
                            .phone(cleanPhone)
                            .dateOfBirth(request.dateOfBirth() != null ? request.dateOfBirth() : LocalDate.now().minusYears(18))
                            .gender(request.gender() != null && !request.gender().isBlank() ? request.gender() : "OTHER")
                            .address(request.address())
                            .build();
                    return applicantRepository.save(newApp);
                });

        // Provision AppUser with Role.APPLICANT
        String username = cleanEmail;
        if (userRepository.existsByUsername(username)) {
            username = cleanEmail.split("@")[0] + "_" + (System.currentTimeMillis() % 10000);
        }

        com.erp.auth.entity.AppUser appUser = new com.erp.auth.entity.AppUser(
                username,
                passwordEncoder.encode(rawPassword),
                cleanEmail,
                Role.APPLICANT,
                true
        );
        com.erp.auth.entity.AppUser savedUser = userRepository.save(appUser);

        applicant.setUserId(savedUser.getId());
        applicantRepository.save(applicant);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Applicant account registered successfully! You may now sign in.");
        response.put("username", savedUser.getUsername());
        response.put("email", cleanEmail);
        response.put("applicantId", applicant.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"/applicant/dashboard", "/applicant-dashboard", "/my-dashboard"})
    public ResponseEntity<?> getApplicantDashboard(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required to access applicant portal. Please sign in."));
        }

        String principalName = authentication.getName();
        com.erp.auth.entity.AppUser user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmailIgnoreCase(principalName))
                .orElse(null);

        Applicant applicant = null;
        if (user != null && user.getId() != null) {
            applicant = applicantRepository.findByUserId(user.getId())
                    .or(() -> applicantRepository.findByEmail(user.getEmail()))
                    .orElse(null);
        }
        if (applicant == null) {
            applicant = applicantRepository.findByEmail(principalName).orElse(null);
        }

        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No applicant record found for current user account."));
        }

        ApplicantDto applicantDto = applicantService.getApplicant(applicant.getId());
        List<AdmissionApplicationDto> applications = applicationService.getApplicationsByApplicant(applicant.getId());
        List<AdmissionInquiry> inquiries = inquiryRepository.findByEmailIgnoreCase(applicant.getEmail()).stream()
                .sorted(java.util.Comparator.comparing((AdmissionInquiry i) -> i.getCreatedAt() != null ? i.getCreatedAt() : Instant.EPOCH)
                        .thenComparing(AdmissionInquiry::getId, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
                        .reversed())
                .toList();

        // Check if applicant is already converted/enrolled as a student
        boolean isEnrolled = false;
        String enrollmentNumber = null;
        Long studentId = null;

        var studentOpt = studentRepository.findByEmail(applicant.getEmail());
        if (studentOpt.isEmpty() && user != null && user.getId() != null) {
            studentOpt = studentRepository.findByUserId(user.getId());
        }

        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            isEnrolled = true;
            enrollmentNumber = s.getEnrollmentNumber();
            studentId = s.getId();
        }

        com.erp.auth.service.ProvisioningCredentialDisclosureService.AccountAccessSummary accessSummary = null;
        if (credentialDisclosureService != null) {
            Optional<AdmissionApplicationDto> enrolledApp = applications.stream()
                    .filter(a -> a.getStatus() == com.erp.admission.application.entity.ApplicationStatus.ENROLLED)
                    .findFirst();
            if (enrolledApp.isPresent()) {
                accessSummary = credentialDisclosureService.getSummary(enrolledApp.get().getId(), applicant.getId(), applicant.getEmail());
            } else if (isEnrolled && !applications.isEmpty()) {
                accessSummary = credentialDisclosureService.getSummary(applications.get(0).getId(), applicant.getId(), applicant.getEmail());
            }
        }

        ApplicantDashboardResponse dashboard = new ApplicantDashboardResponse(
                applicantDto,
                user != null ? user.getUsername() : principalName,
                applications,
                inquiries,
                isEnrolled,
                enrollmentNumber,
                studentId,
                accessSummary
        );

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/applicant/applications/{id}/account-access")
    public ResponseEntity<?> getApplicationAccountAccess(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        Applicant applicant = resolveApplicantFromAuthentication(authentication);
        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Applicant profile not found"));
        }

        AdmissionApplicationDto appDto = applicationService.getApplication(id);
        if (!appDto.getApplicantId().equals(applicant.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized access to application"));
        }

        if (credentialDisclosureService == null) {
            return ResponseEntity.ok(Map.of("message", "Credential disclosure service not available"));
        }

        var summary = credentialDisclosureService.getSummary(id, applicant.getId(), applicant.getEmail());
        if (summary == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Account access details not available for this application"));
        }
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/applicant/applications/{id}/disclose-credentials")
    public ResponseEntity<?> discloseApplicationCredentials(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        Applicant applicant = resolveApplicantFromAuthentication(authentication);
        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Applicant profile not found"));
        }

        AdmissionApplicationDto appDto = applicationService.getApplication(id);
        if (!appDto.getApplicantId().equals(applicant.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized access to application"));
        }

        if (credentialDisclosureService == null) {
            return ResponseEntity.ok(Map.of("message", "Credential disclosure service not available"));
        }

        var disclosed = credentialDisclosureService.disclose(id, applicant.getId());
        return ResponseEntity.ok(disclosed);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AuthenticatedInquiryRequest(
            String programOfInterest,
            @NotBlank String notes
    ) {}

    @PostMapping("/applicant/inquiries")
    public ResponseEntity<?> submitAuthenticatedInquiry(
            @jakarta.validation.Valid @RequestBody AuthenticatedInquiryRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        String principalName = authentication.getName();
        com.erp.auth.entity.AppUser user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmailIgnoreCase(principalName))
                .orElse(null);
        Applicant applicant = null;
        if (user != null && user.getId() != null) {
            applicant = applicantRepository.findByUserId(user.getId())
                    .or(() -> applicantRepository.findByEmail(user.getEmail()))
                    .orElse(null);
        }
        if (applicant == null) {
            applicant = applicantRepository.findByEmail(principalName).orElse(null);
        }
        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No applicant record found"));
        }

        AdmissionInquiry inq = AdmissionInquiry.builder()
                .prospectName(applicant.getFirstName() + " " + applicant.getLastName())
                .email(applicant.getEmail())
                .phone(applicant.getPhone())
                .programOfInterest(request.programOfInterest())
                .status("NEW")
                .notes(request.notes())
                .build();
        AdmissionInquiry saved = inquiryRepository.save(inq);

        notifyAdmins(
                "New Admissions Inquiry",
                "Applicant " + applicant.getFirstName() + " " + applicant.getLastName() + " submitted an inquiry" +
                        (request.programOfInterest() != null ? " for " + request.programOfInterest() : "") + ".",
                "/dashboard/admissions?tab=inquiries"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AuthenticatedApplicationRequest(
            @NotNull Long programId,
            @NotNull Long academicYearId,
            String remarks
    ) {}

    @PostMapping("/applicant/applications")
    public ResponseEntity<?> submitAuthenticatedApplication(
            @jakarta.validation.Valid @RequestBody AuthenticatedApplicationRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Authentication required"));
        }
        String principalName = authentication.getName();
        com.erp.auth.entity.AppUser user = userRepository.findByUsername(principalName)
                .or(() -> userRepository.findByEmailIgnoreCase(principalName))
                .orElse(null);
        Applicant applicant = null;
        if (user != null && user.getId() != null) {
            applicant = applicantRepository.findByUserId(user.getId())
                    .or(() -> applicantRepository.findByEmail(user.getEmail()))
                    .orElse(null);
        }
        if (applicant == null) {
            applicant = applicantRepository.findByEmail(principalName).orElse(null);
        }
        if (applicant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No applicant record found"));
        }

        // Idempotency: prevent repeated clicks creating duplicate applications for the same program and academic year
        List<AdmissionApplicationDto> existingApps = applicationService.getApplicationsByApplicant(applicant.getId());
        Optional<AdmissionApplicationDto> match = existingApps.stream()
                .filter(a -> a.getProgramId().equals(request.programId()) && a.getAcademicYearId().equals(request.academicYearId()))
                .findFirst();

        if (match.isPresent()) {
            return ResponseEntity.ok(match.get());
        }

        AdmissionApplicationDto draft = applicationService.createDraftApplication(
                applicant.getId(),
                request.programId(),
                request.academicYearId()
        );

        AdmissionApplicationDto submitted = applicationService.submitApplication(draft.getId());

        notifyAdmins(
                "New Application: " + submitted.getApplicationNumber(),
                "Formal application submitted by " + applicant.getFirstName() + " " + applicant.getLastName() + ".",
                "/dashboard/admissions?tab=applications"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }
}
