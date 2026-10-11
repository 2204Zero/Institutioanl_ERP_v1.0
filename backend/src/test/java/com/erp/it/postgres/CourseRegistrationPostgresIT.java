package com.erp.it.postgres;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.entity.RegistrationStatus;
import com.erp.academic.course_registration.repository.CourseRegistrationRepository;
import com.erp.academic.course_registration.service.CourseRegistrationService;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.common.exception.BusinessException;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@AutoConfigureMockMvc
public class CourseRegistrationPostgresIT extends AbstractPostgresIT {

    @Autowired
    private CourseRegistrationService registrationService;

    @Autowired
    private CourseRegistrationRepository registrationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private CourseOfferingRepository courseOfferingRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Course course;
    private Semester semester;
    private CourseOffering offering;

    @BeforeEach
    void cleanAndSetup() {
        jdbcTemplate.execute("DELETE FROM course_registration WHERE student_id >= 9100");
        jdbcTemplate.execute("DELETE FROM section_student WHERE student_id >= 9100");
        jdbcTemplate.execute("DELETE FROM section WHERE id >= 9100");
        jdbcTemplate.execute("DELETE FROM course_offering WHERE id >= 9100");
        jdbcTemplate.execute("DELETE FROM semester WHERE id >= 9100");
        jdbcTemplate.execute("DELETE FROM course WHERE id >= 9100");
        jdbcTemplate.execute("DELETE FROM students WHERE id >= 9100");

        course = new Course();
        course.setCode("PG-CS910");
        course.setName("Cloud Systems");
        course.setCredits(4);
        course = courseRepository.save(course);

        semester = new Semester();
        semester.setName("Fall 2026 PG");
        semester.setSemesterNumber(1);
        semester.setIsActive(true);
        semester.setStartDate(LocalDate.now());
        semester.setEndDate(LocalDate.now().plusMonths(3));
        semester = semesterRepository.save(semester);

        offering = new CourseOffering();
        offering.setCourse(course);
        offering.setSemester(semester);
        offering.setIsPublished(true);
        offering.setMaxCapacity(50);
        offering = courseOfferingRepository.save(offering);
    }

    @Test
    @DisplayName("PostgreSQL IT: Concurrent attempts for the final seat cannot exceed section capacity")
    void testConcurrentAttemptsForFinalSeat() throws InterruptedException {
        Section section = new Section();
        section.setName("Section Final Seat");
        section.setCourseOffering(offering);
        section.setCapacity(1); // Exactly 1 seat available
        section.setCurrentEnrollment(0);
        section.setIsActive(true);
        section = sectionRepository.save(section);

        int studentCount = 10;
        List<Student> students = new ArrayList<>();
        for (int i = 0; i < studentCount; i++) {
            Student s = new Student(
                    "PG-STU-" + (9100 + i), "Student" + i, "PG", "pgstu" + i + "@test.edu", "99988877" + i,
                    LocalDate.of(2003, 1, 1), "FEMALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
            );
            students.add(studentRepository.save(s));
        }

        ExecutorService executor = Executors.newFixedThreadPool(studentCount);
        CountDownLatch latch = new CountDownLatch(studentCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        final Long offeringId = offering.getId();
        final Long sectionId = section.getId();

        for (int i = 0; i < studentCount; i++) {
            final Long sId = students.get(i).getId();
            executor.submit(() -> {
                try {
                    registrationService.registerStudent(sId, offeringId, sectionId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(studentCount - 1);

        Section reloadedSection = sectionRepository.findById(sectionId).orElseThrow();
        assertThat(reloadedSection.getCurrentEnrollment()).isEqualTo(1);

        Integer activeSectionStudentCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM section_student WHERE section_id = ? AND is_active = true",
                Integer.class, sectionId);
        assertThat(activeSectionStudentCount).isEqualTo(1);

        Integer registrationCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM course_registration WHERE section_id = ? AND status = 'REGISTERED'",
                Integer.class, sectionId);
        assertThat(registrationCount).isEqualTo(1);
    }

    @Test
    @DisplayName("PostgreSQL IT: Duplicate registration for same course offering is rejected")
    void testDuplicateRegistrationRejected() {
        Section section = new Section();
        section.setName("Section Dup Test");
        section.setCourseOffering(offering);
        section.setCapacity(10);
        section.setCurrentEnrollment(0);
        section.setIsActive(true);
        section = sectionRepository.save(section);

        Student student = studentRepository.save(new Student(
                "PG-STU-9150", "Dup", "Tester", "dup.tester@test.edu", "9998887750",
                LocalDate.of(2003, 1, 1), "MALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        ));

        // First registration succeeds
        CourseRegistration reg1 = registrationService.registerStudent(student.getId(), offering.getId(), section.getId());
        assertThat(reg1.getStatus()).isEqualTo(RegistrationStatus.REGISTERED);

        final Long sId = student.getId();
        final Long oId = offering.getId();
        final Long secId = section.getId();

        // Second registration fails with BusinessException
        assertThrows(BusinessException.class, () ->
                registrationService.registerStudent(sId, oId, secId));
    }

    @Test
    @DisplayName("PostgreSQL IT: Re-registration after drop reactivates record without unique constraint violation")
    void testReRegistrationAfterDrop() {
        Section section = new Section();
        section.setName("Section Drop Test");
        section.setCourseOffering(offering);
        section.setCapacity(5);
        section.setCurrentEnrollment(0);
        section.setIsActive(true);
        section = sectionRepository.save(section);

        Student student = new Student(
                "PG-STU-9160", "Drop", "Tester", "drop.tester@test.edu", "9998887760",
                LocalDate.of(2003, 1, 1), "FEMALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        );
        student = studentRepository.save(student);

        CourseRegistration reg = registrationService.registerStudent(student.getId(), offering.getId(), section.getId());
        assertThat(reg.getStatus()).isEqualTo(RegistrationStatus.REGISTERED);

        // Drop
        CourseRegistration dropped = registrationService.withdrawStudentRegistration(reg.getId(), student.getId());
        assertThat(dropped.getStatus()).isEqualTo(RegistrationStatus.DROPPED);

        Section secAfterDrop = sectionRepository.findById(section.getId()).orElseThrow();
        assertThat(secAfterDrop.getCurrentEnrollment()).isEqualTo(0);

        // Re-register
        CourseRegistration reactivated = registrationService.registerStudent(student.getId(), offering.getId(), section.getId());
        assertThat(reactivated.getId()).isEqualTo(reg.getId());
        assertThat(reactivated.getStatus()).isEqualTo(RegistrationStatus.REGISTERED);

        Section secAfterReactivate = sectionRepository.findById(section.getId()).orElseThrow();
        assertThat(secAfterReactivate.getCurrentEnrollment()).isEqualTo(1);
    }
}
