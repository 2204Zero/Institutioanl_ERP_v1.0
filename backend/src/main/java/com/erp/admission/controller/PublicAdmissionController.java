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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    @Autowired
    public PublicAdmissionController(
            ApplicantService applicantService,
            ApplicantRepository applicantRepository,
            AdmissionApplicationService applicationService,
            ProgramRepository programRepository,
            AcademicYearRepository academicYearRepository,
            UserRepository userRepository,
            @Autowired(required = false) JsonNotificationDataStoreManager notificationManager) {
        this.applicantService = applicantService;
        this.applicantRepository = applicantRepository;
        this.applicationService = applicationService;
        this.programRepository = programRepository;
        this.academicYearRepository = academicYearRepository;
        this.userRepository = userRepository;
        this.notificationManager = notificationManager;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PublicInquiryRequest(
            @JsonAlias({"applicantName", "name", "prospectName"})
            @NotBlank String prospectName,
            @NotBlank @Email String email,
            @NotBlank String phone,
            @JsonAlias({"programOfInterest", "programId"})
            String programOfInterest,
            @JsonAlias({"message", "notes"})
            String notes
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PublicApplicationRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            @NotBlank String phone,
            LocalDate dateOfBirth,
            String gender,
            String address,
            @NotNull Long programId,
            @NotNull Long academicYearId,
            String remarks
    ) {}

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

    private Applicant resolveOrCreateApplicant(String firstName, String lastName, String email, String phone, LocalDate dob, String gender, String address) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanPhone = phone.trim();

        Optional<Applicant> byEmail = applicantRepository.findByEmail(cleanEmail);
        Optional<Applicant> byPhone = applicantRepository.findByPhone(cleanPhone);

        if (byPhone.isPresent()) {
            if (byEmail.isPresent() && byEmail.get().getId().equals(byPhone.get().getId())) {
                return byEmail.get();
            } else {
                throw new ValidationException(
                        "The contact phone number '" + cleanPhone + "' is already registered under another applicant. Please use your registered email or provide a different phone number."
                );
            }
        }

        if (byEmail.isPresent()) {
            Applicant existing = byEmail.get();
            existing.setPhone(cleanPhone);
            return applicantRepository.save(existing);
        }

        ApplicantDto dto = ApplicantDto.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(cleanEmail)
                .phone(cleanPhone)
                .address(address)
                .gender(gender != null ? gender : "OTHER")
                .dateOfBirth(dob != null ? dob : LocalDate.now().minusYears(18))
                .build();

        ApplicantDto registered = applicantService.registerApplicant(dto);
        return applicantRepository.findById(registered.getId())
                .orElseThrow(() -> new BusinessException("Failed to load registered applicant"));
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
    public ResponseEntity<ApplicantDto> submitInquiry(@jakarta.validation.Valid @RequestBody PublicInquiryRequest request) {
        String fullName = request.prospectName() != null ? request.prospectName().trim() : "Applicant";
        String[] nameParts = fullName.split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "Applicant";

        String cleanEmail = request.email().trim().toLowerCase();
        String cleanPhone = request.phone().trim();

        Optional<Applicant> byEmail = applicantRepository.findByEmail(cleanEmail);
        Optional<Applicant> byPhone = applicantRepository.findByPhone(cleanPhone);

        if (byPhone.isPresent()) {
            if (byEmail.isPresent() && byEmail.get().getId().equals(byPhone.get().getId())) {
                return ResponseEntity.ok(applicantService.getApplicant(byEmail.get().getId()));
            } else {
                throw new ValidationException(
                        "The contact phone number '" + cleanPhone + "' is already registered under another applicant. Please use your registered email or provide a different phone number."
                );
            }
        }

        if (byEmail.isPresent()) {
            return ResponseEntity.ok(applicantService.getApplicant(byEmail.get().getId()));
        }

        ApplicantDto applicantDto = ApplicantDto.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(cleanEmail)
                .phone(cleanPhone)
                .address(request.notes())
                .gender("OTHER")
                .dateOfBirth(LocalDate.now().minusYears(18))
                .build();

        ApplicantDto registered = applicantService.registerApplicant(applicantDto);

        // Notify admins about new inquiry
        notifyAdmins(
                "New Admissions Inquiry",
                "Prospective applicant " + fullName + " submitted an inquiry" + (request.programOfInterest() != null ? " for " + request.programOfInterest() : "") + ".",
                "/dashboard/admissions"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    @PostMapping("/applications")
    public ResponseEntity<AdmissionApplicationDto> submitApplication(@jakarta.validation.Valid @RequestBody PublicApplicationRequest request) {
        Applicant applicant = resolveOrCreateApplicant(
                request.firstName().trim(),
                request.lastName().trim(),
                request.email(),
                request.phone(),
                request.dateOfBirth(),
                request.gender(),
                request.address()
        );

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

        // Notify admins about formal application
        notifyAdmins(
                "New Application: " + submitted.getApplicationNumber(),
                "Formal application submitted by " + applicant.getFirstName() + " " + applicant.getLastName() + ".",
                "/dashboard/admissions"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }
}
