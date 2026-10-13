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
import com.erp.common.exception.BusinessException;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admissions/public")
@RequiredArgsConstructor
public class PublicAdmissionController {

    private final ApplicantService applicantService;
    private final ApplicantRepository applicantRepository;
    private final AdmissionApplicationService applicationService;
    private final ProgramRepository programRepository;
    private final AcademicYearRepository academicYearRepository;

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
    public ResponseEntity<ApplicantDto> submitInquiry(@RequestBody PublicInquiryRequest request) {
        String fullName = request.prospectName() != null ? request.prospectName().trim() : "Applicant";
        String[] nameParts = fullName.split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "Applicant";

        Optional<Applicant> existing = applicantRepository.findByEmail(request.email().trim().toLowerCase());
        if (existing.isPresent()) {
            return ResponseEntity.ok(applicantService.getApplicant(existing.get().getId()));
        }

        ApplicantDto applicantDto = ApplicantDto.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(request.email().trim().toLowerCase())
                .phone(request.phone().trim())
                .address(request.notes())
                .gender("OTHER")
                .dateOfBirth(LocalDate.now().minusYears(18))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(applicantService.registerApplicant(applicantDto));
    }

    @PostMapping("/applications")
    public ResponseEntity<AdmissionApplicationDto> submitApplication(@RequestBody PublicApplicationRequest request) {
        String email = request.email().trim().toLowerCase();
        Applicant applicant;
        Optional<Applicant> existing = applicantRepository.findByEmail(email);
        if (existing.isPresent()) {
            applicant = existing.get();
        } else {
            ApplicantDto applicantDto = ApplicantDto.builder()
                    .firstName(request.firstName().trim())
                    .lastName(request.lastName().trim())
                    .email(email)
                    .phone(request.phone().trim())
                    .dateOfBirth(request.dateOfBirth() != null ? request.dateOfBirth() : LocalDate.now().minusYears(18))
                    .gender(request.gender() != null ? request.gender() : "OTHER")
                    .address(request.address())
                    .build();
            ApplicantDto registered = applicantService.registerApplicant(applicantDto);
            applicant = applicantRepository.findById(registered.getId())
                    .orElseThrow(() -> new BusinessException("Failed to load registered applicant"));
        }

        AdmissionApplicationDto draft = applicationService.createDraftApplication(
                applicant.getId(),
                request.programId(),
                request.academicYearId()
        );

        AdmissionApplicationDto submitted = applicationService.submitApplication(draft.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }
}
