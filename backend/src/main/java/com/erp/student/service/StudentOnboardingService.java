package com.erp.student.service;

import com.erp.academic.program.entity.Program;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentEnrollment;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentEnrollmentRepository;
import com.erp.student.repository.StudentRepository;
import com.erp.auth.service.UserAccountProvisioningService;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.admission.document.repository.ApplicantDocumentRepository;
import com.erp.student.repository.StudentDocumentRepository;
import com.erp.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class StudentOnboardingService {

    private final AdmissionApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final UserAccountProvisioningService userAccountProvisioningService;
    private final DepartmentRepository departmentRepository;
    private final ApplicantDocumentRepository applicantDocumentRepository;
    private final StudentDocumentRepository studentDocumentRepository;
    private final UserRepository userRepository;

    public record OnboardingReviewRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            LocalDate dateOfBirth,
            String gender,
            String address,
            Long departmentId,
            Long programId,
            Long academicYearId,
            Long batchId,
            Long semesterId
    ) {}

    @Autowired
    public StudentOnboardingService(
            AdmissionApplicationRepository applicationRepository,
            StudentRepository studentRepository,
            StudentEnrollmentRepository studentEnrollmentRepository,
            BatchRepository batchRepository,
            SemesterRepository semesterRepository,
            UserAccountProvisioningService userAccountProvisioningService,
            @Autowired(required = false) DepartmentRepository departmentRepository,
            @Autowired(required = false) ApplicantDocumentRepository applicantDocumentRepository,
            @Autowired(required = false) StudentDocumentRepository studentDocumentRepository,
            @Autowired(required = false) UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.studentEnrollmentRepository = studentEnrollmentRepository;
        this.batchRepository = batchRepository;
        this.semesterRepository = semesterRepository;
        this.userAccountProvisioningService = userAccountProvisioningService;
        this.departmentRepository = departmentRepository;
        this.applicantDocumentRepository = applicantDocumentRepository;
        this.studentDocumentRepository = studentDocumentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Student onboardStudent(Long applicationId) {
        return onboardStudent(applicationId, null);
    }

    @Transactional
    public Student onboardStudent(Long applicationId, OnboardingReviewRequest reviewRequest) {
        AdmissionApplication application = applicationRepository.findByIdWithPessimisticLock(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Applicant applicant = application.getApplicant();

        // Idempotency: if already enrolled, return existing student safely
        if (application.getStatus() == ApplicationStatus.ENROLLED) {
            var existingEnrollment = studentEnrollmentRepository.findAll().stream()
                    .filter(e -> e.getAcademicYearId().equals(application.getAcademicYear().getId())
                            && e.getProgramId().equals(application.getProgram().getId())
                            && e.getStudent() != null
                            && (e.getStudent().getEmail().equalsIgnoreCase(applicant.getEmail())
                                || e.getStudent().getPhone().equals(applicant.getPhone())))
                    .findFirst();
            if (existingEnrollment.isPresent()) {
                Student existingStudent = existingEnrollment.get().getStudent();
                if (existingStudent.getUserId() != null && userRepository != null) {
                    userRepository.findById(existingStudent.getUserId())
                            .ifPresent(u -> existingStudent.setUsername(u.getUsername()));
                }
                return existingStudent;
            }
        }

        if (application.getStatus() != ApplicationStatus.ADMITTED) {
            throw new BusinessException("Only ADMITTED applications can be converted to students");
        }

        Program program = application.getProgram();

        // Resolve Batch
        Batch matchingBatch = null;
        if (reviewRequest != null && reviewRequest.batchId() != null) {
            matchingBatch = batchRepository.findById(reviewRequest.batchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + reviewRequest.batchId()));
        } else {
            matchingBatch = batchRepository.findByProgramId(program.getId()).stream()
                    .filter(b -> b.getAcademicYearId().equals(application.getAcademicYear().getId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("No valid Batch found for the selected Program and Academic Year. Please configure a Batch first."));
        }

        // Resolve Starting Semester (Semester 1 of the Academic Year)
        Semester startingSemester = null;
        if (reviewRequest != null && reviewRequest.semesterId() != null) {
            startingSemester = semesterRepository.findById(reviewRequest.semesterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + reviewRequest.semesterId()));
        } else {
            startingSemester = semesterRepository.findByAcademicYearId(application.getAcademicYear().getId()).stream()
                    .filter(s -> s.getSemesterNumber() == 1)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("No valid Semester 1 found for the selected Academic Year. Please configure Semester 1 first."));
        }

        // Resolve Department Name
        String departmentName = "General";
        if (reviewRequest != null && reviewRequest.departmentId() != null && departmentRepository != null) {
            departmentName = departmentRepository.findById(reviewRequest.departmentId())
                    .map(Department::getName)
                    .orElse("General");
        } else if (program.getDepartmentId() != null && departmentRepository != null) {
            departmentName = departmentRepository.findById(program.getDepartmentId())
                    .map(Department::getName)
                    .orElse("General");
        }

        String firstName = reviewRequest != null && reviewRequest.firstName() != null && !reviewRequest.firstName().isBlank()
                ? reviewRequest.firstName().trim() : applicant.getFirstName();
        String lastName = reviewRequest != null && reviewRequest.lastName() != null && !reviewRequest.lastName().isBlank()
                ? reviewRequest.lastName().trim() : applicant.getLastName();
        String phone = reviewRequest != null && reviewRequest.phone() != null && !reviewRequest.phone().isBlank()
                ? reviewRequest.phone().trim() : applicant.getPhone();
        LocalDate dob = reviewRequest != null && reviewRequest.dateOfBirth() != null
                ? reviewRequest.dateOfBirth() : applicant.getDateOfBirth();
        String gender = reviewRequest != null && reviewRequest.gender() != null && !reviewRequest.gender().isBlank()
                ? reviewRequest.gender() : applicant.getGender();
        String address = reviewRequest != null && reviewRequest.address() != null
                ? reviewRequest.address() : applicant.getAddress();

        String rollNumber = "STU-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        
        // Generate Institutional Email with collision protection
        String baseEmail = (firstName + "." + lastName).toLowerCase().replaceAll("[^a-z0-9.]", "");
        String institutionalEmail = baseEmail + "@institution.edu";
        int counter = 1;
        while (studentRepository.existsByEmail(institutionalEmail)) {
            institutionalEmail = baseEmail + counter + "@institution.edu";
            counter++;
        }

        Student student = new Student(
                rollNumber,
                firstName,
                lastName,
                institutionalEmail,
                phone,
                dob,
                gender,
                departmentName,
                matchingBatch.getName(),
                LocalDate.now()
        );

        // Provision student login account
        UserAccountProvisioningService.ProvisionedAccount studentAccount = null;
        if (userAccountProvisioningService != null) {
            studentAccount = userAccountProvisioningService.provisionOrLinkStudentAccount(
                    institutionalEmail,
                    null,
                    rollNumber.toLowerCase()
            );
            if (studentAccount != null && studentAccount.user() != null) {
                student.setUserId(studentAccount.user().getId());
            }
        }

        // Canonical enrollment number generation (ENR-YYYY-XXXXX)
        int currentYear = LocalDate.now().getYear();
        String prefix = String.format("ENR-%d-", currentYear);
        long maxSeq = 0;
        for (Student s : studentRepository.findAll()) {
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
        String canonicalEnrollmentNumber = String.format("%s%05d", prefix, nextSeq);
        while (studentRepository.existsByEnrollmentNumber(canonicalEnrollmentNumber)) {
            nextSeq++;
            canonicalEnrollmentNumber = String.format("%s%05d", prefix, nextSeq);
        }

        student.setEnrollmentNumber(canonicalEnrollmentNumber);
        student.setAddress(address);
        Student savedStudent = studentRepository.save(student);

        // Populate transient initial credentials on student for caller
        if (studentAccount != null) {
            savedStudent.setTemporaryPassword(studentAccount.rawPassword());
            if (studentAccount.user() != null) {
                savedStudent.setUsername(studentAccount.user().getUsername());
            }
        }

        StudentEnrollment enrollment = new StudentEnrollment();
        enrollment.setEnrollmentNumber(canonicalEnrollmentNumber);
        enrollment.setStudent(savedStudent);
        enrollment.setAcademicYearId(application.getAcademicYear().getId());
        enrollment.setProgramId(program.getId());
        enrollment.setBatchId(matchingBatch.getId());
        enrollment.setSemesterId(startingSemester.getId());
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus(StudentStatus.ACTIVE);
        
        studentEnrollmentRepository.save(enrollment);

        // Transfer verified / uploaded applicant documents to student documents
        if (applicantDocumentRepository != null && studentDocumentRepository != null) {
            try {
                var appDocs = applicantDocumentRepository.findByApplicantId(applicant.getId());
                for (var appDoc : appDocs) {
                    com.erp.student.entity.DocumentType docType = com.erp.student.entity.DocumentType.MARKSHEET;
                    String dtUpper = appDoc.getDocumentType() != null ? appDoc.getDocumentType().toUpperCase() : "";
                    if (dtUpper.contains("PHOTO")) {
                        docType = com.erp.student.entity.DocumentType.PHOTOGRAPH;
                    } else if (dtUpper.contains("ID") || dtUpper.contains("AADHAAR")) {
                        docType = com.erp.student.entity.DocumentType.AADHAAR;
                    } else if (dtUpper.contains("TRANSFER")) {
                        docType = com.erp.student.entity.DocumentType.TRANSFER_CERTIFICATE;
                    } else if (dtUpper.contains("MIGRATION")) {
                        docType = com.erp.student.entity.DocumentType.MIGRATION;
                    }

                    if (studentDocumentRepository.findByStudentIdAndDocumentType(savedStudent.getId(), docType).isEmpty()) {
                        String fileName = "stu_" + savedStudent.getId() + "_" + docType.name() + ".pdf";
                        com.erp.student.entity.StudentDocument sDoc = new com.erp.student.entity.StudentDocument(
                                savedStudent,
                                docType,
                                fileName,
                                appDoc.getDocumentType(),
                                "application/pdf",
                                102400L,
                                appDoc.getFileUrl() != null ? appDoc.getFileUrl() : "uploads/documents/" + fileName
                        );
                        studentDocumentRepository.save(sDoc);
                    }
                }
            } catch (Exception ignored) {}
        }

        // Update Application Status
        application.setStatus(ApplicationStatus.ENROLLED);
        applicationRepository.save(application);

        return savedStudent;
    }
}
