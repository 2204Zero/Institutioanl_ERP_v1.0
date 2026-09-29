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

    public GuardianServiceImpl(GuardianRepository guardianRepository,
                               StudentRepository studentRepository,
                               GuardianMapper guardianMapper) {
        this.guardianRepository = guardianRepository;
        this.studentRepository = studentRepository;
        this.guardianMapper = guardianMapper;
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

        if (requestDto.getStudentId() != null) {
            Student student = studentRepository.findById(requestDto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", requestDto.getStudentId()));
            guardian.setStudent(student);
        }

        Guardian savedGuardian = guardianRepository.save(guardian);
        return guardianMapper.toDto(savedGuardian);
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

        Guardian savedGuardian = guardianRepository.save(guardian);
        return guardianMapper.toDto(savedGuardian);
    }

    @Override
    public GuardianResponseDto linkGuardianToStudent(Long studentId, Long guardianId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian", "id", guardianId));

        guardian.setStudent(student);
        Guardian updatedGuardian = guardianRepository.save(guardian);
        return guardianMapper.toDto(updatedGuardian);
    }
}
