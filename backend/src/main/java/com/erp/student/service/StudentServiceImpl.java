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
        if (studentRepository.existsByRollNumber(requestDto.getRollNumber().trim())) {
            throw new BusinessException("A student with roll number '" + requestDto.getRollNumber() + "' already exists.");
        }
        if (studentRepository.existsByEmail(requestDto.getEmail().trim().toLowerCase())) {
            throw new BusinessException("A student with email '" + requestDto.getEmail() + "' already exists.");
        }

        Student student = studentMapper.toEntity(requestDto);
        Student savedStudent = studentRepository.save(student);

        // Record initial status in history
        StudentStatusHistory history = new StudentStatusHistory(
                savedStudent,
                null,
                savedStudent.getStatus(),
                "Initial student enrollment",
                "system"
        );
        statusHistoryRepository.save(history);

        return studentMapper.toDto(savedStudent);
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

        // Check roll number uniqueness if changed
        if (!student.getRollNumber().equalsIgnoreCase(requestDto.getRollNumber().trim())) {
            if (studentRepository.existsByRollNumber(requestDto.getRollNumber().trim())) {
                throw new BusinessException("A student with roll number '" + requestDto.getRollNumber() + "' already exists.");
            }
        }

        // Check email uniqueness if changed
        if (!student.getEmail().equalsIgnoreCase(requestDto.getEmail().trim())) {
            if (studentRepository.existsByEmail(requestDto.getEmail().trim().toLowerCase())) {
                throw new BusinessException("A student with email '" + requestDto.getEmail() + "' already exists.");
            }
        }

        studentMapper.updateEntityFromDto(requestDto, student);
        Student updatedStudent = studentRepository.save(student);
        return studentMapper.toDto(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        studentRepository.delete(student);
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

        student.setStatus(newStatus);
        Student savedStudent = studentRepository.save(student);

        // Record status transition in audit log
        StudentStatusHistory history = new StudentStatusHistory(
                savedStudent,
                previousStatus,
                newStatus,
                statusUpdateDto.getReason() != null ? statusUpdateDto.getReason() : "Status updated to " + newStatus,
                statusUpdateDto.getChangedBy() != null ? statusUpdateDto.getChangedBy() : "admin"
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
