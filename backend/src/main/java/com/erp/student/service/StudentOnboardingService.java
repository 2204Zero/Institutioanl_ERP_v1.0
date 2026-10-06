package com.erp.student.service;

import com.erp.academic.program.entity.Program;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentEnrollment;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentEnrollmentRepository;
import com.erp.student.repository.StudentRepository;
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

    @Transactional
    public Student onboardStudent(Long applicationId) {
        AdmissionApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (application.getStatus() != ApplicationStatus.ADMITTED) {
            throw new BusinessException("Only ADMITTED applications can be converted to students");
        }

        Applicant applicant = application.getApplicant();
        Program program = application.getProgram();

        String rollNumber = "STU-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        
        // Generate Institutional Email
        String institutionalEmail = applicant.getFirstName().toLowerCase() + "." + applicant.getLastName().toLowerCase() + "@institution.edu";

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
        student.setAddress(applicant.getAddress());
        Student savedStudent = studentRepository.save(student);

        // We assume Semester 1 is default for new admissions, but we'll mock the ID to 1L for simplicity 
        StudentEnrollment enrollment = new StudentEnrollment();
        enrollment.setEnrollmentNumber("ENR-" + savedStudent.getRollNumber());
        enrollment.setStudent(savedStudent);
        enrollment.setAcademicYearId(application.getAcademicYear().getId());
        enrollment.setProgramId(program.getId());
        enrollment.setBatchId(1L); // Usually derived from AcademicYear/Program mapping
        enrollment.setSemesterId(1L); // Starting semester
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus(StudentStatus.ACTIVE);
        
        studentEnrollmentRepository.save(enrollment);

        // Update Application Status
        application.setStatus(ApplicationStatus.ENROLLED);
        applicationRepository.save(application);

        return savedStudent;
    }
}
