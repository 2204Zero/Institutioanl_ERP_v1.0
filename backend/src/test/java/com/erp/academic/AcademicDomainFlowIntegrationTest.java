package com.erp.academic;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.academic.batch.dto.BatchCreateRequest;
import com.erp.academic.batch.dto.BatchResponse;
import com.erp.academic.batch.service.BatchService;
import com.erp.academic.course.dto.CourseCreateRequest;
import com.erp.academic.course.dto.CourseResponse;
import com.erp.academic.course.service.CourseService;
import com.erp.academic.curriculum.dto.CurriculumCourseAssignRequest;
import com.erp.academic.curriculum.dto.CurriculumCreateRequest;
import com.erp.academic.curriculum.dto.CurriculumResponse;
import com.erp.academic.curriculum.service.CurriculumService;
import com.erp.academic.program.dto.ProgramCreateRequest;
import com.erp.academic.program.dto.ProgramResponse;
import com.erp.academic.program.service.ProgramService;
import com.erp.academic.section.dto.*;
import com.erp.academic.section.service.SectionService;
import com.erp.academic.semester.dto.SemesterCreateRequest;
import com.erp.academic.semester.dto.SemesterResponse;
import com.erp.academic.semester.service.SemesterService;
import com.erp.academic.subject.dto.SubjectCreateRequest;
import com.erp.academic.subject.dto.SubjectResponse;
import com.erp.academic.subject.service.SubjectService;
import com.erp.common.exception.BusinessException;
import com.erp.department.entity.Department;
import com.erp.department.repository.DepartmentRepository;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AcademicDomainFlowIntegrationTest {

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SemesterService semesterService;

    @Autowired
    private ProgramService programService;

    @Autowired
    private BatchService batchService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private CurriculumService curriculumService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private SectionService sectionService;

    private Long academicYearId;
    private Long departmentId;
    private Long student1Id;
    private Long student2Id;

    private Student createStudent(String rollNumber, String firstName, String lastName, String email) {
        Student s = new Student();
        s.setRollNumber(rollNumber);
        s.setFirstName(firstName);
        s.setLastName(lastName);
        s.setEmail(email);
        s.setPhone("9876543210");
        s.setDateOfBirth(LocalDate.of(2004, 5, 12));
        s.setGender("Male");
        s.setEnrollmentDate(LocalDate.of(2026, 8, 1));
        s.setDepartment("CSE");
        s.setProgram("B.Tech");
        s.setBatch("2026");
        s.setStatus(StudentStatus.ACTIVE);
        return studentRepository.save(s);
    }

    @BeforeEach
    void setupBaseData() {
        AcademicYear ay = new AcademicYear();
        ay.setName("2026-27");
        ay.setStartDate(LocalDate.of(2026, 7, 1));
        ay.setEndDate(LocalDate.of(2027, 6, 30));
        ay.setIsActive(true);
        academicYearId = academicYearRepository.save(ay).getId();

        Department dept = new Department();
        dept.setName("Computer Science & Engineering");
        dept.setCode("CSE");
        departmentId = departmentRepository.save(dept).getId();

        Student s1 = createStudent("ENR-2026-101", "Aarav", "Sharma", "aarav.sharma@example.com");
        student1Id = s1.getId();

        Student s2 = createStudent("ENR-2026-102", "Diya", "Patel", "diya.patel@example.com");
        student2Id = s2.getId();
    }

    @Test
    @DisplayName("Complete Academic Domain Flow: Days 01 through 06 integration test")
    void testCompleteAcademicDomainLifecycle() {
        // -------------------------------------------------------------
        // DAY 01: Semester Management
        // -------------------------------------------------------------
        SemesterCreateRequest sem1Request = SemesterCreateRequest.builder()
                .name("Semester 1")
                .semesterNumber(1)
                .academicYearId(academicYearId)
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 12, 20))
                .isActive(true)
                .build();
        SemesterResponse sem1 = semesterService.create(sem1Request);
        assertThat(sem1.getId()).isNotNull();
        assertThat(sem1.getSemesterNumber()).isEqualTo(1);

        SemesterCreateRequest sem2Request = SemesterCreateRequest.builder()
                .name("Semester 2")
                .semesterNumber(2)
                .academicYearId(academicYearId)
                .startDate(LocalDate.of(2027, 1, 10))
                .endDate(LocalDate.of(2027, 5, 30))
                .isActive(true)
                .build();
        SemesterResponse sem2 = semesterService.create(sem2Request);
        assertThat(sem2.getSemesterNumber()).isEqualTo(2);

        // Verify duplicate semester number in same academic year is blocked
        assertThatThrownBy(() -> semesterService.create(sem1Request))
                .isInstanceOf(BusinessException.class);

        // Deactivate & Activate
        SemesterResponse deactivatedSem = semesterService.deactivate(sem1.getId());
        assertThat(deactivatedSem.getIsActive()).isFalse();
        SemesterResponse activatedSem = semesterService.activate(sem1.getId());
        assertThat(activatedSem.getIsActive()).isTrue();

        // -------------------------------------------------------------
        // DAY 02: Program & Batch Management
        // -------------------------------------------------------------
        ProgramCreateRequest progReq = ProgramCreateRequest.builder()
                .code("BTECH_AIDS")
                .name("B.Tech Artificial Intelligence & Data Science")
                .degree("B.Tech")
                .duration(4)
                .departmentId(departmentId)
                .isActive(true)
                .build();
        ProgramResponse program = programService.create(progReq);
        assertThat(program.getCode()).isEqualTo("BTECH_AIDS");

        // Code uniqueness check
        assertThatThrownBy(() -> programService.create(progReq))
                .isInstanceOf(BusinessException.class);

        BatchCreateRequest batchReq = BatchCreateRequest.builder()
                .name("2026 Batch")
                .code("BATCH-2026-AIDS")
                .programId(program.getId())
                .admissionYear(2026)
                .graduationYear(2030)
                .academicYearId(academicYearId)
                .isActive(true)
                .build();
        BatchResponse batch = batchService.create(batchReq);
        assertThat(batch.getCode()).isEqualTo("BATCH-2026-AIDS");
        assertThat(batch.getGraduationYear()).isEqualTo(2030);

        // -------------------------------------------------------------
        // DAY 03: Course Management
        // -------------------------------------------------------------
        CourseCreateRequest dbmsReq = CourseCreateRequest.builder()
                .code("CS301")
                .name("Database Management Systems")
                .courseType("THEORY")
                .credits(4)
                .departmentId(departmentId)
                .programId(program.getId())
                .isActive(true)
                .build();
        CourseResponse dbmsCourse = courseService.create(dbmsReq);

        CourseCreateRequest cnReq = CourseCreateRequest.builder()
                .code("CS302")
                .name("Computer Networks")
                .courseType("THEORY")
                .credits(4)
                .departmentId(departmentId)
                .programId(program.getId())
                .isActive(true)
                .build();
        CourseResponse cnCourse = courseService.create(cnReq);

        CourseCreateRequest aiReq = CourseCreateRequest.builder()
                .code("AI301")
                .name("Artificial Intelligence")
                .courseType("THEORY")
                .credits(3)
                .departmentId(departmentId)
                .programId(program.getId())
                .isActive(true)
                .build();
        CourseResponse aiCourse = courseService.create(aiReq);

        CourseCreateRequest electiveReq = CourseCreateRequest.builder()
                .code("EL301")
                .name("Cloud Computing Elective")
                .courseType("ELECTIVE")
                .credits(3)
                .departmentId(departmentId)
                .programId(program.getId())
                .isActive(true)
                .build();
        CourseResponse electiveCourse = courseService.create(electiveReq);

        // Search & Filter courses
        List<CourseResponse> searchCourses = courseService.getAll("Database", departmentId, null, null, null);
        assertThat(searchCourses).hasSize(1);
        assertThat(searchCourses.get(0).getCode()).isEqualTo("CS301");

        // -------------------------------------------------------------
        // DAY 04: Curriculum Management
        // -------------------------------------------------------------
        CurriculumCreateRequest currReq = CurriculumCreateRequest.builder()
                .version("2026.1")
                .programId(program.getId())
                .semesterId(sem1.getId())
                .effectiveAcademicYearId(academicYearId)
                .isActive(true)
                .build();
        CurriculumResponse curriculum = curriculumService.create(currReq);
        assertThat(curriculum.getVersion()).isEqualTo("2026.1");

        // Assign courses to curriculum with mandatory/elective classification
        curriculumService.assignCourse(curriculum.getId(), CurriculumCourseAssignRequest.builder()
                .courseId(dbmsCourse.getId())
                .classification("MANDATORY")
                .build());

        curriculumService.assignCourse(curriculum.getId(), CurriculumCourseAssignRequest.builder()
                .courseId(cnCourse.getId())
                .classification("MANDATORY")
                .build());

        curriculumService.assignCourse(curriculum.getId(), CurriculumCourseAssignRequest.builder()
                .courseId(aiCourse.getId())
                .classification("MANDATORY")
                .build());

        curriculumService.assignCourse(curriculum.getId(), CurriculumCourseAssignRequest.builder()
                .courseId(electiveCourse.getId())
                .classification("ELECTIVE")
                .build());

        // Validate curriculum updated total credits = 4 + 4 + 3 + 3 = 14
        CurriculumResponse fetchedCurriculum = curriculumService.getById(curriculum.getId());
        assertThat(fetchedCurriculum.getTotalCredits()).isEqualTo(14);
        assertThat(fetchedCurriculum.getCourses()).hasSize(4);

        // -------------------------------------------------------------
        // DAY 05: Subject Management
        // -------------------------------------------------------------
        SubjectCreateRequest sub1 = SubjectCreateRequest.builder()
                .code("AI301-T")
                .name("Artificial Intelligence Theory")
                .subjectType("CORE")
                .credits(3)
                .isPractical(false)
                .departmentId(departmentId)
                .courseId(aiCourse.getId())
                .programId(program.getId())
                .isActive(true)
                .build();
        SubjectResponse aiTheory = subjectService.create(sub1);
        assertThat(aiTheory.getCode()).isEqualTo("AI301-T");
        assertThat(aiTheory.getIsPractical()).isFalse();

        SubjectCreateRequest sub2 = SubjectCreateRequest.builder()
                .code("AI301-P")
                .name("Artificial Intelligence Lab")
                .subjectType("CORE")
                .credits(1)
                .isPractical(true)
                .departmentId(departmentId)
                .courseId(aiCourse.getId())
                .programId(program.getId())
                .isActive(true)
                .build();
        SubjectResponse aiLab = subjectService.create(sub2);
        assertThat(aiLab.getIsPractical()).isTrue();

        // -------------------------------------------------------------
        // DAY 06: Section / Class Management
        // -------------------------------------------------------------
        SectionCreateRequest secReq = SectionCreateRequest.builder()
                .name("Section A")
                .batchId(batch.getId())
                .semesterId(sem1.getId())
                .capacity(2) // Capacity = 2
                .isActive(true)
                .build();
        SectionResponse section = sectionService.create(secReq);
        assertThat(section.getName()).isEqualTo("Section A");
        assertThat(section.getCapacity()).isEqualTo(2);

        // Assign Students
        List<SectionStudentResponse> assignedStudents = sectionService.assignStudents(section.getId(),
                SectionStudentAssignRequest.builder().studentIds(List.of(student1Id, student2Id)).build());
        assertThat(assignedStudents).hasSize(2);

        // Verify current enrollment
        SectionResponse updatedSection = sectionService.getById(section.getId());
        assertThat(updatedSection.getCurrentEnrollment()).isEqualTo(2);

        // Verify capacity limit enforcement: 3rd student must be rejected
        Student s3 = createStudent("ENR-2026-103", "Rohan", "Verma", "rohan.verma@example.com");

        assertThatThrownBy(() -> sectionService.assignStudents(section.getId(),
                SectionStudentAssignRequest.builder().studentIds(List.of(s3.getId())).build()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("capacity exceeded");

        // Assign Faculty to Section
        SectionFacultyResponse facultyAssignment = sectionService.assignFaculty(section.getId(),
                SectionFacultyAssignRequest.builder()
                        .facultyId(999L)
                        .subjectId(aiTheory.getId())
                        .role("CLASS_TEACHER")
                        .build());
        assertThat(facultyAssignment.getRole()).isEqualTo("CLASS_TEACHER");

        List<SectionFacultyResponse> facultyList = sectionService.getFaculty(section.getId());
        assertThat(facultyList).hasSize(1);
        assertThat(facultyList.get(0).getSubjectName()).isEqualTo("Artificial Intelligence Theory");
    }
}
