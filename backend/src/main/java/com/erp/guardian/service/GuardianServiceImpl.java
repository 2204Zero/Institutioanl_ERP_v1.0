package com.erp.guardian.service;

import com.erp.common.exception.ResourceNotFoundException;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.dto.GuardianResponseDto;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.mapper.GuardianMapper;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GuardianServiceImpl implements GuardianService {

    private final GuardianRepository guardianRepository;
    private final StudentRepository studentRepository;
    private final GuardianMapper guardianMapper;
    private final com.erp.auth.service.UserAccountProvisioningService userAccountProvisioningService;

    public GuardianServiceImpl(GuardianRepository guardianRepository,
                               StudentRepository studentRepository,
                               GuardianMapper guardianMapper,
                               com.erp.auth.service.UserAccountProvisioningService userAccountProvisioningService) {
        this.guardianRepository = guardianRepository;
        this.studentRepository = studentRepository;
        this.guardianMapper = guardianMapper;
        this.userAccountProvisioningService = userAccountProvisioningService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianResponseDto> getAllGuardians() {
        return guardianRepository.findAll().stream()
                .map(guardianMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianResponseDto getGuardianById(Long id) {
        Guardian guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian", "id", id));
        return guardianMapper.toDto(guardian);
    }

    @Override
    public GuardianResponseDto createGuardian(GuardianRequestDto requestDto) {
        Guardian guardian = guardianMapper.toEntity(requestDto);

        com.erp.auth.service.UserAccountProvisioningService.ProvisionedAccount account = null;
        if (requestDto.getEmail() != null && !requestDto.getEmail().isBlank()) {
            account = userAccountProvisioningService.provisionOrLinkGuardianAccount(
                    requestDto.getEmail(),
                    null,
                    null
            );
            if (account != null) {
                guardian.setUserId(account.user().getId());
            }
        }

        if (requestDto.getStudentId() != null) {
            Student student = studentRepository.findById(requestDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", requestDto.getStudentId()));
            guardian.setStudent(student);
        }

        Guardian savedGuardian = guardianRepository.save(guardian);
        GuardianResponseDto dto = guardianMapper.toDto(savedGuardian);
        if (account != null) {
            dto.setTemporaryPassword(account.rawPassword());
            dto.setUsername(account.user().getUsername());
        }
        return dto;
    }

    @Override
    public GuardianResponseDto updateGuardian(Long id, GuardianRequestDto requestDto) {
        Guardian guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian", "id", id));

        guardianMapper.updateEntityFromDto(requestDto, guardian);

        if (requestDto.getStudentId() != null) {
            Student student = studentRepository.findById(requestDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", requestDto.getStudentId()));
            guardian.setStudent(student);
        }

        Guardian updatedGuardian = guardianRepository.save(guardian);
        return guardianMapper.toDto(updatedGuardian);
    }

    @Override
    public void deleteGuardian(Long id) {
        Guardian guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian", "id", id));
        guardianRepository.delete(guardian);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianResponseDto> getGuardiansByStudentId(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return guardianRepository.findByStudentId(studentId).stream()
                .map(guardianMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public GuardianResponseDto addGuardianToStudent(Long studentId, GuardianRequestDto requestDto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Guardian guardian = guardianMapper.toEntity(requestDto);
        guardian.setStudent(student);

        com.erp.auth.service.UserAccountProvisioningService.ProvisionedAccount account = null;
        if (requestDto.getEmail() != null && !requestDto.getEmail().isBlank()) {
            account = userAccountProvisioningService.provisionOrLinkGuardianAccount(
                    requestDto.getEmail(),
                    null,
                    null
            );
            if (account != null) {
                guardian.setUserId(account.user().getId());
            }
        }

        Guardian savedGuardian = guardianRepository.save(guardian);
        GuardianResponseDto dto = guardianMapper.toDto(savedGuardian);
        if (account != null) {
            dto.setTemporaryPassword(account.rawPassword());
            dto.setUsername(account.user().getUsername());
        }
        return dto;
    }

    @Override
    public GuardianResponseDto linkGuardianToStudent(Long studentId, Long guardianId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian", "id", guardianId));

        if (guardian.getStudent() != null && guardian.getStudent().getId().equals(studentId)) {
            return guardianMapper.toDto(guardian);
        }

        if (guardian.getStudent() == null) {
            guardian.setStudent(student);
            Guardian updatedGuardian = guardianRepository.save(guardian);
            return guardianMapper.toDto(updatedGuardian);
        }

        // Multi-ward linking: Create a relationship record for the new ward with identical guardian credentials & userId
        Guardian multiWardGuardian = new Guardian();
        multiWardGuardian.setFirstName(guardian.getFirstName());
        multiWardGuardian.setLastName(guardian.getLastName());
        multiWardGuardian.setRelation(guardian.getRelation());
        multiWardGuardian.setPhone(guardian.getPhone());
        multiWardGuardian.setEmail(guardian.getEmail());
        multiWardGuardian.setOccupation(guardian.getOccupation());
        multiWardGuardian.setAddress(guardian.getAddress());
        multiWardGuardian.setIsEmergencyContact(guardian.getIsEmergencyContact());
        multiWardGuardian.setUserId(guardian.getUserId());
        multiWardGuardian.setStudent(student);

        Guardian savedMultiWardGuardian = guardianRepository.save(multiWardGuardian);
        return guardianMapper.toDto(savedMultiWardGuardian);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianResponseDto> getGuardiansByEmail(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }
        return guardianRepository.findByEmail(email).stream()
                .map(guardianMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianResponseDto> getGuardiansByUserId(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return guardianRepository.findByUserId(userId).stream()
                .map(guardianMapper::toDto)
                .collect(Collectors.toList());
    }
}
