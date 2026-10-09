package com.erp.student.service;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.response.PageResponse;
import com.erp.student.dto.StudentRequestDto;
import com.erp.student.dto.StudentResponseDto;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.entity.StudentStatusHistory;
import com.erp.student.mapper.StudentMapper;
import com.erp.student.repository.StudentRepository;
import com.erp.student.repository.StudentStatusHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentStatusHistoryRepository statusHistoryRepository;
    private final StudentMapper studentMapper;

    public StudentServiceImpl(StudentRepository studentRepository,
                              StudentStatusHistoryRepository statusHistoryRepository,
                              StudentMapper studentMapper) {
        this.studentRepository = studentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.studentMapper = studentMapper;
    }

    @Override
    public StudentResponseDto createStudent(StudentRequestDto requestDto) {
        if (studentRepository.existsByEmail(requestDto.getEmail().trim().toLowerCase())) {
            throw new BusinessException("A student with email '" + requestDto.getEmail() + "' already exists.");
        }

        if (requestDto.getEnrollmentDate() == null) {
            throw new BusinessException("Enrollment date is required for Enrollment ID generation.");
        }

        // Validate branch and gender before saving
        String branchCode = getBranchCode(requestDto.getDepartment());
        String genderCode = getGenderCode(requestDto.getGender());
        int year = requestDto.getEnrollmentDate().getYear() % 100;

        Student student = studentMapper.toEntity(requestDto);
        // Temporary roll number to satisfy non-null constraint during initial insert
        student.setRollNumber("ENR-TEMP-" + java.util.UUID.randomUUID().toString());

        Student savedStudent = studentRepository.saveAndFlush(student);

        // Generate final roll number: YY + BRANCH_CODE + GENDER_CODE + 3-digit-ID
        String finalRollNumber = String.format("%02d%s%s%03d", year, branchCode, genderCode, savedStudent.getId());
        
        if (studentRepository.existsByRollNumber(finalRollNumber)) {
            throw new BusinessException("Generated Enrollment ID collision detected: " + finalRollNumber);
        }

        savedStudent.setRollNumber(finalRollNumber);
        savedStudent = studentRepository.save(savedStudent);

        // Record initial status in history
        StudentStatusHistory history = new StudentStatusHistory(
                savedStudent,
                null,
                savedStudent.getStatus(),
                "Initial student enrollment",
                "system",
                java.time.LocalDate.now()
        );
        statusHistoryRepository.save(history);

        return studentMapper.toDto(savedStudent);
    }

    private String getBranchCode(String department) {
        if (department == null) {
            throw new BusinessException("Enrollment ID cannot be generated because department is missing.");
        }
        String dept = department.trim().toUpperCase();
        return switch (dept) {
            case "COMPUTER SCIENCE AND ENGINEERING", "COMPUTER SCIENCE" -> "CS";
            case "ELECTRONICS AND COMMUNICATION ENGINEERING", "ELECTRONICS AND COMMUNICATION" -> "EC";
            case "MECHANICAL ENGINEERING", "MECHANICAL" -> "ME";
            case "CIVIL ENGINEERING", "CIVIL" -> "CE";
            case "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE" -> "AI";
            case "INFORMATION TECHNOLOGY" -> "IT";
            case "ELECTRICAL AND ELECTRONICS ENGINEERING" -> "EE";
            default -> throw new BusinessException("Enrollment ID cannot be generated because no branch code is configured for the selected program/department: " + department);
        };
    }

    private String getGenderCode(String gender) {
        if (gender == null) {
            throw new BusinessException("Enrollment ID cannot be generated because gender is missing.");
        }
        String g = gender.trim().toUpperCase();
        if (g.equals("MALE")) return "M";
        if (g.equals("FEMALE")) return "F";
        if (g.equals("OTHER")) return "O";
        throw new BusinessException("Enrollment ID cannot be generated because gender is invalid: " + gender);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return studentMapper.toDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentByRollNumber(String rollNumber) {
        Student student = studentRepository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "rollNumber", rollNumber));
        return studentMapper.toDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StudentResponseDto> getAllStudents(int page, int size, String query,
                                                          StudentStatus status, String department,
                                                          String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Student> studentPage = studentRepository.searchStudents(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                status,
                (department != null && !department.trim().isEmpty()) ? department.trim() : null,
                pageable
        );

        List<StudentResponseDto> content = studentPage.getContent().stream()
                .map(studentMapper::toDto)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                studentPage.getNumber(),
                studentPage.getSize(),
                studentPage.getTotalElements(),
                studentPage.getTotalPages(),
                studentPage.isLast()
        );
    }

    @Override
    public StudentResponseDto updateStudent(Long id, StudentRequestDto requestDto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Check email uniqueness if changed
        if (!student.getEmail().equalsIgnoreCase(requestDto.getEmail().trim())) {
            if (studentRepository.existsByEmail(requestDto.getEmail().trim().toLowerCase())) {
                throw new BusinessException("A student with email '" + requestDto.getEmail() + "' already exists.");
            }
        }

        studentMapper.updateEntityFromDto(requestDto, student);
        // StudentMapper explicitly ignores client-provided rollNumber.
        // Therefore, the institutional Enrollment ID is completely immutable.

        Student updatedStudent = studentRepository.save(student);
        return studentMapper.toDto(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        studentRepository.delete(student);
    }

    private void validateStatusTransition(StudentStatus current, StudentStatus target) {
        if (current == target) return;
        boolean isValid = switch (current) {
            case ACTIVE -> target == StudentStatus.GRADUATED || target == StudentStatus.SUSPENDED 
                        || target == StudentStatus.TRANSFERRED || target == StudentStatus.DROPPED 
                        || target == StudentStatus.INACTIVE;
            case INACTIVE, SUSPENDED -> target == StudentStatus.ACTIVE || target == StudentStatus.DROPPED 
                                     || target == StudentStatus.TRANSFERRED;
            case GRADUATED -> target == StudentStatus.ALUMNI;
            case ALUMNI, DROPPED, TRANSFERRED -> false; // Terminal states
        };
        if (!isValid) {
            throw new BusinessException("Invalid status transition from " + current + " to " + target);
        }
    }

    @Override
    public StudentResponseDto updateStudentStatus(Long id, StudentStatusUpdateDto statusUpdateDto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        StudentStatus previousStatus = student.getStatus();
        StudentStatus newStatus = statusUpdateDto.getStatus();

        if (previousStatus == newStatus) {
            return studentMapper.toDto(student);
        }

        validateStatusTransition(previousStatus, newStatus);

        student.setStatus(newStatus);
        Student savedStudent = studentRepository.save(student);

        // Record status transition in audit log
        StudentStatusHistory history = new StudentStatusHistory(
                savedStudent,
                previousStatus,
                newStatus,
                statusUpdateDto.getReason() != null ? statusUpdateDto.getReason() : "Status updated to " + newStatus,
                statusUpdateDto.getChangedBy() != null ? statusUpdateDto.getChangedBy() : "admin",
                statusUpdateDto.getEffectiveDate() != null ? statusUpdateDto.getEffectiveDate() : java.time.LocalDate.now()
        );
        statusHistoryRepository.save(history);

        return studentMapper.toDto(savedStudent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentStatusHistory> getStatusHistory(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return statusHistoryRepository.findByStudentIdOrderByChangedAtDesc(studentId);
    }
}
