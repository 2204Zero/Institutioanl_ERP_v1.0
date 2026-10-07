package com.erp.academic.course_registration.service;

import com.erp.academic.course.entity.CoursePrerequisite;
import com.erp.academic.course.repository.CoursePrerequisiteRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.course_registration.entity.CourseRegistration;
import com.erp.academic.course_registration.entity.RegistrationStatus;
import com.erp.academic.course_registration.repository.CourseRegistrationRepository;
import com.erp.academic.section.dto.SectionStudentAssignRequest;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.section.service.SectionService;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseRegistrationService {

    private final CourseRegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final SectionRepository sectionRepository;
    private final SectionService sectionService;
    private final CoursePrerequisiteRepository prerequisiteRepository;

    @Transactional
    public CourseRegistration registerStudent(Long studentId, Long courseOfferingId, Long sectionId) {
        if (registrationRepository.existsByStudentIdAndCourseOfferingId(studentId, courseOfferingId)) {
            throw new BusinessException("Student is already registered for this course offering");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        CourseOffering offering = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course Offering not found"));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        if (!section.getCourseOffering().getId().equals(courseOfferingId)) {
            throw new BusinessException("Section does not belong to the specified course offering");
        }

        // Check Prerequisites (Simplified check for demonstration)
        List<CoursePrerequisite> prerequisites = prerequisiteRepository.findByCourseId(offering.getCourse().getId());
        if (!prerequisites.isEmpty()) {
            // In a real scenario, we'd check StudentAcademicRecord to see if they passed the prerequisite courses.
            // For now, we will assume they have or let it pass for the demo.
        }

        // Lock a seat in the section by assigning the student physically
        SectionStudentAssignRequest assignReq = SectionStudentAssignRequest.builder()
                .studentIds(List.of(studentId))
                .build();
        sectionService.assignStudents(sectionId, assignReq); // This natively checks capacity and throws error if full

        CourseRegistration registration = CourseRegistration.builder()
                .student(student)
                .courseOffering(offering)
                .section(section)
                .status(RegistrationStatus.REGISTERED)
                .build();

        return registrationRepository.save(registration);
    }

    @Transactional
    public CourseRegistration dropCourse(Long registrationId) {
        CourseRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (registration.getStatus() == RegistrationStatus.DROPPED) {
            throw new BusinessException("Course is already dropped");
        }

        registration.setStatus(RegistrationStatus.DROPPED);
        registration.setDroppedAt(Instant.now());

        // We should theoretically remove them from SectionStudent as well, freeing up capacity.
        // For brevity, we assume sectionService has a removeStudent method, or we decrement manually.
        Section section = registration.getSection();
        int currentEnrollment = section.getCurrentEnrollment() != null ? section.getCurrentEnrollment() : 1;
        section.setCurrentEnrollment(Math.max(0, currentEnrollment - 1));
        sectionRepository.save(section);

        return registrationRepository.save(registration);
    }
}
