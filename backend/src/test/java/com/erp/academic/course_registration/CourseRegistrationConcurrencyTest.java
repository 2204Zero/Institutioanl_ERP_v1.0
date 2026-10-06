package com.erp.academic.course_registration;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.section.dto.SectionCreateRequest;
import com.erp.academic.section.dto.SectionResponse;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.service.SectionService;
import com.erp.academic.course_registration.service.CourseRegistrationService;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class CourseRegistrationConcurrencyTest {

    @Autowired private CourseRegistrationService registrationService;
    @Autowired private SectionService sectionService;
    @Autowired private StudentRepository studentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private SemesterRepository semesterRepository;
    @Autowired private CourseOfferingRepository courseOfferingRepository;
    @Autowired private SectionRepository sectionRepository;

    @Test
    public void testConcurrentRegistrationLocksCapacity() throws InterruptedException {
        // Setup base data
        Course course = new Course();
        course.setName("Concurrency 101");
        course = courseRepository.save(course);

        Semester semester = new Semester();
        semester.setName("Fall 2026");
        semester = semesterRepository.save(semester);

        CourseOffering offering = new CourseOffering();
        offering.setCourse(course);
        offering.setSemester(semester);
        offering.setIsPublished(true);
        offering.setMaxCapacity(10);
        offering = courseOfferingRepository.save(offering);

        SectionCreateRequest sectionReq = SectionCreateRequest.builder()
                .name("Section A")
                .courseOfferingId(offering.getId())
                .capacity(10) // Strictly 10 seats
                .isActive(true)
                .build();
        SectionResponse section = sectionService.create(sectionReq);

        // Create 20 students
        List<Long> studentIds = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            Student s = new Student(
                    "CONC-" + i, "First" + i, "Last", "conc" + i + "@test.com", "123",
                    LocalDate.now(), "MALE", "Dept", "Batch", LocalDate.now()
            );
            studentIds.add(studentRepository.save(s).getId());
        }

        // Simulate 20 concurrent threads trying to register for 10 seats
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        final Long oId = offering.getId();
        final Long secId = section.getId();

        for (int i = 0; i < threadCount; i++) {
            final Long sId = studentIds.get(i);
            executor.submit(() -> {
                try {
                    registrationService.registerStudent(sId, oId, secId);
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

        // Verify that exactly 10 succeeded and 10 failed
        assertThat(successCount.get()).isEqualTo(10);
        assertThat(failureCount.get()).isEqualTo(10);

        // Verify section capacity in DB
        var updatedSection = sectionRepository.findById(section.getId()).orElseThrow();
        assertThat(updatedSection.getCurrentEnrollment()).isEqualTo(10);
    }
}
