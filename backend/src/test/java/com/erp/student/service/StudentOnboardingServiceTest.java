package com.erp.student.service;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.program.entity.Program;
import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.application.entity.AdmissionApplication;
import com.erp.admission.application.entity.ApplicationStatus;
import com.erp.admission.application.repository.AdmissionApplicationRepository;
import com.erp.common.exception.BusinessException;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentEnrollmentRepository;
import com.erp.student.repository.StudentRepository;
import com.erp.academic.batch.entity.Batch;
import com.erp.academic.batch.repository.BatchRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StudentOnboardingServiceTest {

    @Mock
    private AdmissionApplicationRepository applicationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private StudentEnrollmentRepository studentEnrollmentRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private StudentOnboardingService onboardingService;

    private AdmissionApplication application;

    @BeforeEach
    public void setup() {
        Applicant applicant = new Applicant();
        applicant.setFirstName("John");
        applicant.setLastName("Doe");
        applicant.setPhone("1234567890");
        applicant.setDateOfBirth(LocalDate.of(2000, 1, 1));
        applicant.setGender("Male");

        Program program = new Program();
        program.setId(1L);
        program.setName("Computer Science");

        AcademicYear year = new AcademicYear();
        year.setId(1L);

        application = new AdmissionApplication();
        application.setId(1L);
        application.setApplicant(applicant);
        application.setProgram(program);
        application.setAcademicYear(year);
        application.setStatus(ApplicationStatus.ADMITTED);
    }

    @Test
    public void testOnboardStudent_Success() {
        Batch batch = new Batch();
        batch.setId(10L);
        batch.setAcademicYearId(1L);
        batch.setProgramId(1L);

        Semester semester = new Semester();
        semester.setId(20L);
        semester.setAcademicYearId(1L);
        semester.setSemesterNumber(1);

        when(applicationRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(application));
        when(batchRepository.findByProgramId(1L)).thenReturn(List.of(batch));
        when(semesterRepository.findByAcademicYearId(1L)).thenReturn(List.of(semester));

        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student student = invocation.getArgument(0);
            student.setId(1L);
            return student;
        });

        Student saved = onboardingService.onboardStudent(1L);

        assertNotNull(saved);
        assertEquals("John", saved.getFirstName());
        assertEquals("Doe", saved.getLastName());
        assertEquals(ApplicationStatus.ENROLLED, application.getStatus());

        verify(studentRepository, times(1)).save(any(Student.class));
        verify(studentEnrollmentRepository, times(1)).save(any());
        verify(applicationRepository, times(1)).save(application);
    }

    @Test
    public void testOnboardStudent_InvalidStatus() {
        application.setStatus(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(application));

        assertThrows(BusinessException.class, () -> onboardingService.onboardStudent(1L));

        verify(studentRepository, never()).save(any());
        verify(applicationRepository, never()).save(any());
    }

    @Test
    public void testOnboardStudent_DuplicateCall() {
        Batch batch = new Batch();
        batch.setId(10L);
        batch.setAcademicYearId(1L);
        batch.setProgramId(1L);

        Semester semester = new Semester();
        semester.setId(20L);
        semester.setAcademicYearId(1L);
        semester.setSemesterNumber(1);

        when(applicationRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(application));
        when(batchRepository.findByProgramId(1L)).thenReturn(List.of(batch));
        when(semesterRepository.findByAcademicYearId(1L)).thenReturn(List.of(semester));

        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student student = invocation.getArgument(0);
            student.setId(1L);
            return student;
        });

        onboardingService.onboardStudent(1L);

        // the status is now ENROLLED in memory
        assertThrows(BusinessException.class, () -> onboardingService.onboardStudent(1L));
        
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    public void testOnboardStudent_MissingBatch() {
        when(applicationRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(application));
        when(batchRepository.findByProgramId(1L)).thenReturn(List.of()); // Returns empty list

        BusinessException exception = assertThrows(BusinessException.class, () -> onboardingService.onboardStudent(1L));
        assertEquals("No valid Batch found for the selected Program and Academic Year. Please configure a Batch first.", exception.getMessage());
        
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    public void testOnboardStudent_MissingSemester() {
        Batch batch = new Batch();
        batch.setId(10L);
        batch.setAcademicYearId(1L);
        batch.setProgramId(1L);

        when(applicationRepository.findByIdWithPessimisticLock(1L)).thenReturn(Optional.of(application));
        when(batchRepository.findByProgramId(1L)).thenReturn(List.of(batch));
        when(semesterRepository.findByAcademicYearId(1L)).thenReturn(List.of()); // Returns empty list

        BusinessException exception = assertThrows(BusinessException.class, () -> onboardingService.onboardStudent(1L));
        assertEquals("No valid Semester 1 found for the selected Academic Year. Please configure Semester 1 first.", exception.getMessage());
        
        verify(studentRepository, never()).save(any(Student.class));
    }
}
