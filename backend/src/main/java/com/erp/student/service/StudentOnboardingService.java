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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentOnboardingService {

    private final AdmissionApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final BatchRepository batchRepository;
    private final SemesterRepository semesterRepository;
    private final UserAccountProvisioningService userAccountProvisioningService;

    @Transactional
    public Student onboardStudent(Long applicationId) {
        AdmissionApplication application = applicationRepository.findByIdWithPessimisticLock(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getStatus() != ApplicationStatus.ADMITTED) {
            throw new BusinessException("Only ADMITTED applications can be converted to students");
        }

        Applicant applicant = application.getApplicant();
        Program program = application.getProgram();

        // Resolve Batch
        Batch matchingBatch = batchRepository.findByProgramId(program.getId()).stream()
                .filter(b -> b.getAcademicYearId().equals(application.getAcademicYear().getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("No valid Batch found for the selected Program and Academic Year. Please configure a Batch first."));

        // Resolve Starting Semester (Semester 1 of the Academic Year)
        Semester startingSemester = semesterRepository.findByAcademicYearId(application.getAcademicYear().getId()).stream()
                .filter(s -> s.getSemesterNumber() == 1)
                .findFirst()
                .orElseThrow(() -> new BusinessException("No valid Semester 1 found for the selected Academic Year. Please configure Semester 1 first."));

        String rollNumber = "STU-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        
        // Generate Institutional Email with collision protection
        String baseEmail = (applicant.getFirstName() + "." + applicant.getLastName()).toLowerCase().replaceAll("[^a-z0-9.]", "");
        String institutionalEmail = baseEmail + "@institution.edu";
        int counter = 1;
        while (studentRepository.existsByEmail(institutionalEmail)) {
            institutionalEmail = baseEmail + counter + "@institution.edu";
            counter++;
        }

        Student student = new Student(
                rollNumber,
                applicant.getFirstName(),
                applicant.getLastName(),
                institutionalEmail,
                applicant.getPhone(),
                applicant.getDateOfBirth(),
                applicant.getGender(),
                program.getDepartmentId() != null ? "Dept-" + program.getDepartmentId() : "General",
                program.getName() + " Batch",
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
        student.setAddress(applicant.getAddress());
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

        // Update Application Status
        application.setStatus(ApplicationStatus.ENROLLED);
        applicationRepository.save(application);

        return savedStudent;
    }
}
