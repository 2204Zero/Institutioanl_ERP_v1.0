package com.erp.admission.applicant.service;

import com.erp.admission.applicant.dto.ApplicantDto;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ApplicantService {

    private final ApplicantRepository applicantRepository;

    @Transactional
    public ApplicantDto registerApplicant(ApplicantDto request) {
        if (applicantRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Applicant with this email already exists");
        }

        Applicant applicant = Applicant.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .build();

        Applicant saved = applicantRepository.save(applicant);
        request.setId(saved.getId());
        return request;
    }

    @Transactional(readOnly = true)
    public java.util.List<ApplicantDto> getAllApplicants() {
        return applicantRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing((Applicant a) -> a.getCreatedAt() != null ? a.getCreatedAt() : java.time.Instant.EPOCH)
                        .thenComparing(Applicant::getId, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
                        .reversed())
                .map(this::mapToDto)
                .toList();
    }

    private ApplicantDto mapToDto(Applicant applicant) {
        LocalDate inqDate = applicant.getCreatedAt() != null
                ? LocalDate.ofInstant(applicant.getCreatedAt(), java.time.ZoneId.systemDefault())
                : null;
        return ApplicantDto.builder()
                .id(applicant.getId())
                .firstName(applicant.getFirstName())
                .lastName(applicant.getLastName())
                .email(applicant.getEmail())
                .phone(applicant.getPhone())
                .dateOfBirth(applicant.getDateOfBirth())
                .gender(applicant.getGender())
                .address(applicant.getAddress())
                .createdAt(applicant.getCreatedAt())
                .inquiryDate(inqDate)
                .build();
    }

    public ApplicantDto getApplicant(Long id) {
        Applicant applicant = applicantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        return mapToDto(applicant);
    }
}


