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
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getStatus() != null && student.getStatus() != StudentStatus.ACTIVE) {
            throw new BusinessException("Student account is not active for course registration");
        }

        Optional<CourseRegistration> existingOpt = registrationRepository.findByStudentIdAndCourseOfferingId(studentId, courseOfferingId);
        if (existingOpt.isPresent()) {
            CourseRegistration existing = existingOpt.get();
            if (existing.getStatus() == RegistrationStatus.REGISTERED) {
                throw new BusinessException("Student is already registered for this course offering");
            }
        }

        CourseOffering offering = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course Offering not found"));

        if (Boolean.FALSE.equals(offering.getIsPublished())) {
            throw new BusinessException("Course offering is not published for registration");
        }

        if (offering.getSemester() != null) {
            if (Boolean.FALSE.equals(offering.getSemester().getIsActive())) {
                throw new BusinessException("Cannot register for course in an inactive semester");
            }
            if (offering.getSemester().getEndDate() != null && LocalDate.now().isAfter(offering.getSemester().getEndDate())) {
                throw new BusinessException("Registration window closed: semester has ended");
            }
        }

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        if (!section.getCourseOffering().getId().equals(courseOfferingId)) {
            throw new BusinessException("Section does not belong to the specified course offering");
        }

        if (Boolean.FALSE.equals(section.getIsActive())) {
            throw new BusinessException("Cannot register for an inactive section");
        }

        // Check Course Prerequisites
        List<CoursePrerequisite> prerequisites = prerequisiteRepository.findByCourseId(offering.getCourse().getId());
        if (!prerequisites.isEmpty()) {
            List<CourseRegistration> studentRegistrations = registrationRepository.findByStudentId(studentId);
            Set<Long> registeredCourseIds = studentRegistrations.stream()
                    .filter(r -> r.getStatus() == RegistrationStatus.REGISTERED)
                    .filter(r -> r.getCourseOffering() != null && r.getCourseOffering().getCourse() != null)
                    .map(r -> r.getCourseOffering().getCourse().getId())
                    .collect(Collectors.toSet());

            for (CoursePrerequisite prereq : prerequisites) {
                Long prereqCourseId = prereq.getPrerequisiteCourse().getId();
                if (!registeredCourseIds.contains(prereqCourseId)) {
                    throw new BusinessException(String.format(
                            "Prerequisite not satisfied: Student has not completed or registered for required course '%s (%s)'",
                            prereq.getPrerequisiteCourse().getName(),
                            prereq.getPrerequisiteCourse().getCode()
                    ));
                }
            }
        }

        // Lock a seat in the section by assigning the student physically via pessimistic write lock in SectionService
        SectionStudentAssignRequest assignReq = SectionStudentAssignRequest.builder()
                .studentIds(List.of(studentId))
                .build();
        sectionService.assignStudents(sectionId, assignReq);

        if (existingOpt.isPresent()) {
            CourseRegistration existing = existingOpt.get();
            existing.setSection(section);
            existing.setStatus(RegistrationStatus.REGISTERED);
            existing.setRegisteredAt(Instant.now());
            existing.setDroppedAt(null);
            return registrationRepository.save(existing);
        }

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

        if (registration.getCourseOffering() != null && registration.getCourseOffering().getSemester() != null) {
            var semester = registration.getCourseOffering().getSemester();
            if (semester.getEndDate() != null && LocalDate.now().isAfter(semester.getEndDate())) {
                throw new BusinessException("Withdrawal window closed: semester has ended");
            }
        }

        registration.setStatus(RegistrationStatus.DROPPED);
        registration.setDroppedAt(Instant.now());

        Section section = registration.getSection();
        if (section != null) {
            try {
                sectionService.removeStudent(section.getId(), registration.getStudent().getId());
            } catch (Exception e) {
                int currentEnrollment = section.getCurrentEnrollment() != null ? section.getCurrentEnrollment() : 1;
                section.setCurrentEnrollment(Math.max(0, currentEnrollment - 1));
                sectionRepository.save(section);
            }
        }

        return registrationRepository.save(registration);
    }

    @Transactional
    public CourseRegistration withdrawStudentRegistration(Long registrationId, Long authenticatedStudentId) {
        CourseRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (!registration.getStudent().getId().equals(authenticatedStudentId)) {
            throw new AccessDeniedException("Cannot withdraw registration belonging to another student");
        }

        return dropCourse(registrationId);
    }

    @Transactional(readOnly = true)
    public List<CourseRegistration> getByStudentId(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }
}
