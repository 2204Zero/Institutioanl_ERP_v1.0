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
import com.erp.auth.service.UserAccountProvisioningService;
import com.erp.guardian.dto.GuardianRequestDto;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.academic.program.entity.Program;
import com.erp.academic.program.repository.ProgramRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.student.entity.StudentEnrollment;
import com.erp.student.repository.StudentEnrollmentRepository;
import com.erp.guardian.service.GuardianService;
import com.erp.auth.repository.UserRepository;
import com.erp.devjson.notification.JsonNotificationDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired(required = false)
    private JsonNotificationDataStoreManager notificationManager;

    @Autowired(required = false)
    private UserRepository userRepository;

    private final StudentRepository studentRepository;
    private final StudentStatusHistoryRepository statusHistoryRepository;
    private final StudentMapper studentMapper;
    private final UserAccountProvisioningService userAccountProvisioningService;
    private final GuardianRepository guardianRepository;
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;
    private final BatchRepository batchRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final GuardianService guardianService;

    public StudentServiceImpl(StudentRepository studentRepository,
                              StudentStatusHistoryRepository statusHistoryRepository,
                              StudentMapper studentMapper,
                              UserAccountProvisioningService userAccountProvisioningService,
                              GuardianRepository guardianRepository,
                              DepartmentRepository departmentRepository,
                              ProgramRepository programRepository,
                              BatchRepository batchRepository,
                              AcademicYearRepository academicYearRepository,
                              SemesterRepository semesterRepository,
                              StudentEnrollmentRepository studentEnrollmentRepository,
                              GuardianService guardianService) {
        this.studentRepository = studentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.studentMapper = studentMapper;
        this.userAccountProvisioningService = userAccountProvisioningService;
        this.guardianRepository = guardianRepository;
        this.departmentRepository = departmentRepository;
        this.programRepository = programRepository;
        this.batchRepository = batchRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.studentEnrollmentRepository = studentEnrollmentRepository;
        this.guardianService = guardianService;
    }

    public synchronized String generateCanonicalEnrollmentNumber(int year) {
        String prefix = String.format("ENR-%d-", year);
        long maxSeq = 0;
        List<Student> students = studentRepository.findAll();
        for (Student s : students) {
            String enr = s.getEnrollmentNumber();
            if (enr != null && enr.startsWith(prefix)) {
                try {
                    String seqPart = enr.substring(prefix.length());
                    long seq = Long.parseLong(seqPart);
                    if (seq > maxSeq) {
                        maxSeq = seq;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        long nextSeq = maxSeq + 1;
        String candidate = String.format("%s%05d", prefix, nextSeq);
        while (studentRepository.existsByEnrollmentNumber(candidate)) {
            nextSeq++;
            candidate = String.format("%s%05d", prefix, nextSeq);
        }
        return candidate;
    }

    @Override
    public StudentResponseDto createStudent(StudentRequestDto requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();
        if (studentRepository.existsByEmail(email)) {
            throw new BusinessException("A student with email '" + requestDto.getEmail() + "' already exists.");
        }

        if (requestDto.getEnrollmentDate() == null) {
            requestDto.setEnrollmentDate(java.time.LocalDate.now());
        }

        // Validate academic references
        if (requestDto.getDepartmentId() != null) {
            var dept = departmentRepository.findById(requestDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDto.getDepartmentId()));
            if (requestDto.getDepartment() == null || requestDto.getDepartment().isBlank()) {
                requestDto.setDepartment(dept.getName());
            }
        }
        if (requestDto.getProgramId() != null) {
            var prog = programRepository.findById(requestDto.getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program", "id", requestDto.getProgramId()));
            if (requestDto.getProgram() == null || requestDto.getProgram().isBlank()) {
                requestDto.setProgram(prog.getName());
            }
        }
        if (requestDto.getBatchId() != null) {
            var batch = batchRepository.findById(requestDto.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", requestDto.getBatchId()));
            if (requestDto.getBatch() == null || requestDto.getBatch().isBlank()) {
                requestDto.setBatch(batch.getName());
            }
        }
        if (requestDto.getAcademicYearId() != null) {
            if (!academicYearRepository.existsById(requestDto.getAcademicYearId())) {
                throw new ResourceNotFoundException("AcademicYear", "id", requestDto.getAcademicYearId());
            }
        }
        if (requestDto.getSemesterId() != null) {
            if (!semesterRepository.existsById(requestDto.getSemesterId())) {
                throw new ResourceNotFoundException("Semester", "id", requestDto.getSemesterId());
            }
        }

        String branchCode = getBranchCode(requestDto.getDepartment());
        String genderCode = getGenderCode(requestDto.getGender());
        int year = requestDto.getEnrollmentDate().getYear() % 100;
        int fullYear = requestDto.getEnrollmentDate().getYear();

        // Canonical enrollment number generation (ENR-YYYY-XXXXX)
        String canonicalEnrollmentNumber;
        if (requestDto.getEnrollmentNumber() != null && !requestDto.getEnrollmentNumber().isBlank()) {
            if (studentRepository.existsByEnrollmentNumber(requestDto.getEnrollmentNumber().trim())) {
                throw new BusinessException("Student with enrollment number '" + requestDto.getEnrollmentNumber() + "' already exists.");
            }
            canonicalEnrollmentNumber = requestDto.getEnrollmentNumber().trim();
        } else {
            canonicalEnrollmentNumber = generateCanonicalEnrollmentNumber(fullYear);
        }

        // Provision or link user login account safely
        UserAccountProvisioningService.ProvisionedAccount studentAccount =
                userAccountProvisioningService.provisionOrLinkStudentAccount(
                        email,
                        requestDto.getPassword(),
                        null
                );

        Student student = studentMapper.toEntity(requestDto);
        student.setUserId(studentAccount.user().getId());
        student.setEnrollmentNumber(canonicalEnrollmentNumber);

        // Roll number check or generation
        if (requestDto.getRollNumber() != null && !requestDto.getRollNumber().isBlank()) {
            if (studentRepository.existsByRollNumber(requestDto.getRollNumber().trim())) {
                throw new BusinessException("Student with roll number '" + requestDto.getRollNumber() + "' already exists.");
            }
            student.setRollNumber(requestDto.getRollNumber().trim());
        } else {
            student.setRollNumber("ROLL-TEMP-" + java.util.UUID.randomUUID().toString());
        }

        Student savedStudent = studentRepository.saveAndFlush(student);

        // If temporary roll number was used, generate final distinct roll number
        if (savedStudent.getRollNumber().startsWith("ROLL-TEMP-")) {
            String finalRollNumber = String.format("%02d%s%s%03d", year, branchCode, genderCode, savedStudent.getId());
            if (studentRepository.existsByRollNumber(finalRollNumber)) {
                finalRollNumber = "ROLL-" + fullYear + "-" + String.format("%05d", savedStudent.getId());
            }
            savedStudent.setRollNumber(finalRollNumber);
        }

        // Guardian linkage
        com.erp.guardian.dto.GuardianResponseDto attachedGuardianDto = null;
        if (requestDto.getGuardianId() != null) {
            attachedGuardianDto = guardianService.linkGuardianToStudent(savedStudent.getId(), requestDto.getGuardianId());
        } else if (requestDto.getGuardian() != null) {
            com.erp.guardian.dto.GuardianRequestDto gDto = requestDto.getGuardian();
            attachedGuardianDto = guardianService.addGuardianToStudent(savedStudent.getId(), gDto);
        }

        // Student Enrollment record
        if (requestDto.getAcademicYearId() != null) {
            StudentEnrollment enrollment = new StudentEnrollment();
            enrollment.setStudent(savedStudent);
            enrollment.setEnrollmentNumber(canonicalEnrollmentNumber);
            enrollment.setAcademicYearId(requestDto.getAcademicYearId());
            enrollment.setProgramId(requestDto.getProgramId() != null ? requestDto.getProgramId() : 1L);
            enrollment.setBatchId(requestDto.getBatchId() != null ? requestDto.getBatchId() : 1L);
            enrollment.setSemesterId(requestDto.getSemesterId() != null ? requestDto.getSemesterId() : 1L);
            enrollment.setEnrollmentDate(savedStudent.getEnrollmentDate());
            enrollment.setStatus(savedStudent.getStatus());
            studentEnrollmentRepository.save(enrollment);
        }

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

        StudentResponseDto responseDto = studentMapper.toDto(savedStudent);
        responseDto.setTemporaryPassword(studentAccount.rawPassword());
        responseDto.setUsername(studentAccount.user().getUsername());
        if (attachedGuardianDto != null) {
            responseDto.setGuardians(java.util.List.of(attachedGuardianDto));
        } else {
            try {
                java.util.List<com.erp.guardian.dto.GuardianResponseDto> gList = guardianService.getGuardiansByStudentId(savedStudent.getId());
                if (gList != null && !gList.isEmpty()) {
                    responseDto.setGuardians(gList);
                }
            } catch (Exception ignored) {}
        }
        return responseDto;
    }

    private String getBranchCode(String department) {
        if (department == null || department.isBlank()) {
            return "GN";
        }
        String dept = department.trim().toUpperCase();
        return switch (dept) {
            case "COMPUTER SCIENCE AND ENGINEERING", "COMPUTER SCIENCE", "CSE" -> "CS";
            case "ELECTRONICS AND COMMUNICATION ENGINEERING", "ELECTRONICS AND COMMUNICATION", "ECE" -> "EC";
            case "MECHANICAL ENGINEERING", "MECHANICAL", "ME" -> "ME";
            case "CIVIL ENGINEERING", "CIVIL", "CE" -> "CE";
            case "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", "AI" -> "AI";
            case "INFORMATION TECHNOLOGY", "IT" -> "IT";
            case "ELECTRICAL AND ELECTRONICS ENGINEERING", "EEE" -> "EE";
            default -> {
                String clean = dept.replaceAll("[^A-Z]", "");
                yield clean.length() >= 2 ? clean.substring(0, 2) : (clean + "X").substring(0, 2);
            }
        };
    }

    private String getGenderCode(String gender) {
        if (gender == null || gender.isBlank()) {
            return "U";
        }
        String g = gender.trim().toUpperCase();
        if (g.startsWith("M")) return "M";
        if (g.startsWith("F")) return "F";
        return "O";
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
    public StudentResponseDto getStudentByEnrollmentNumber(String enrollmentNumber) {
        Student student = studentRepository.findByEnrollmentNumber(enrollmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "enrollmentNumber", enrollmentNumber));
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
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        Long numericId = null;
        if (cleanQuery != null) {
            String idCandidate = cleanQuery.startsWith("#") ? cleanQuery.substring(1).trim() : cleanQuery;
            if (idCandidate.matches("^\\d+$")) {
                try {
                    numericId = Long.parseLong(idCandidate);
                } catch (NumberFormatException ignored) {}
            }
        }

        Page<Student> studentPage = studentRepository.searchStudents(
                cleanQuery,
                numericId,
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
        if (requestDto.getEmail() != null && !student.getEmail().equalsIgnoreCase(requestDto.getEmail().trim())) {
            if (studentRepository.existsByEmail(requestDto.getEmail().trim().toLowerCase())) {
                throw new BusinessException("A student with email '" + requestDto.getEmail() + "' already exists.");
            }
        }

        // Academic entity lookups if IDs provided
        if (requestDto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(requestDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDto.getDepartmentId()));
            requestDto.setDepartment(dept.getName());
        }
        if (requestDto.getProgramId() != null) {
            Program prog = programRepository.findById(requestDto.getProgramId())
                    .orElseThrow(() -> new ResourceNotFoundException("Program", "id", requestDto.getProgramId()));
            requestDto.setProgram(prog.getName());
        }
        if (requestDto.getBatchId() != null) {
            Batch batch = batchRepository.findById(requestDto.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", requestDto.getBatchId()));
            requestDto.setBatch(batch.getName());
        }

        // Preserve immutable identifiers
        String originalEnrollmentNumber = student.getEnrollmentNumber();
        String originalRollNumber = student.getRollNumber();
        Long originalUserId = student.getUserId();

        studentMapper.updateEntityFromDto(requestDto, student);

        // Strict immutability enforcement
        if (originalEnrollmentNumber != null && !originalEnrollmentNumber.isBlank()) {
            student.setEnrollmentNumber(originalEnrollmentNumber);
        }
        student.setRollNumber(originalRollNumber);
        student.setUserId(originalUserId);

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

        // Emit notifications to student and linked parent/guardians
        if (notificationManager != null) {
            String statusStr = newStatus.name();
            String formattedStatus = statusStr.length() > 1
                    ? Character.toUpperCase(statusStr.charAt(0)) + statusStr.substring(1).toLowerCase()
                    : statusStr;
            String studentName = (savedStudent.getFirstName() + " " + savedStudent.getLastName()).trim();

            // 1. Student notification
            Long studentUserId = savedStudent.getUserId();
            if (studentUserId == null && savedStudent.getEmail() != null && userRepository != null) {
                userRepository.findByEmailIgnoreCase(savedStudent.getEmail()).ifPresent(u -> {
                    savedStudent.setUserId(u.getId());
                    studentRepository.save(savedStudent);
                });
                studentUserId = savedStudent.getUserId();
            }

            if (studentUserId != null) {
                notificationManager.createNotification(
                        studentUserId,
                        "Student Status Update",
                        "Your student account status has been changed to " + formattedStatus + ".",
                        "STATUS_CHANGE",
                        "/dashboard/profile"
                );
            }

            // 2. Linked parent/guardian notifications
            List<Guardian> guardians = guardianRepository.findByStudentId(savedStudent.getId());
            for (Guardian guardian : guardians) {
                Long gUserId = guardian.getUserId();
                if (gUserId == null && guardian.getEmail() != null && userRepository != null) {
                    var uOpt = userRepository.findByEmailIgnoreCase(guardian.getEmail());
                    if (uOpt.isPresent()) {
                        gUserId = uOpt.get().getId();
                        guardian.setUserId(gUserId);
                        guardianRepository.save(guardian);
                    }
                }
                if (gUserId != null) {
                    notificationManager.createNotification(
                            gUserId,
                            "Student Status Update",
                            "The status of " + studentName + " has been changed to " + formattedStatus + ".",
                            "STATUS_CHANGE",
                            "/dashboard/students"
                    );
                }
            }
        }

        return studentMapper.toDto(savedStudent);
    }

    public void setNotificationManager(JsonNotificationDataStoreManager notificationManager) {
        this.notificationManager = notificationManager;
    }

    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
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
