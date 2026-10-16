package com.erp.academic.course_offering.service;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.academic.course_offering.entity.CourseOffering;
import com.erp.academic.course_offering.dto.CourseOfferingResponse;
import com.erp.academic.course_offering.mapper.CourseOfferingMapper;
import com.erp.academic.course_offering.repository.CourseOfferingRepository;
import com.erp.academic.semester.entity.Semester;
import com.erp.academic.semester.repository.SemesterRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final CourseOfferingMapper courseOfferingMapper;

    @Transactional
    public CourseOffering createCourseOffering(Long courseId, Long semesterId, Integer maxCapacity) {
        return createCourseOffering(courseId, semesterId, maxCapacity, false);
    }

    @Transactional
    public CourseOffering createCourseOffering(Long courseId, Long semesterId, Integer maxCapacity, Boolean isPublished) {
        if (courseOfferingRepository.existsByCourseIdAndSemesterId(courseId, semesterId)) {
            throw new BusinessException("This course is already offered in the specified semester.");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
                
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found"));

        if (!semester.getIsActive()) {
            throw new BusinessException("Cannot offer a course in an inactive semester.");
        }

        CourseOffering offering = CourseOffering.builder()
                .course(course)
                .semester(semester)
                .maxCapacity(maxCapacity)
                .isPublished(isPublished != null ? isPublished : false)
                .build();

        return courseOfferingRepository.save(offering);
    }

    @Transactional
    public CourseOffering publishCourseOffering(Long id) {
        CourseOffering offering = courseOfferingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found with id: " + id));
        offering.setIsPublished(true);
        return courseOfferingRepository.save(offering);
    }

    @Transactional
    public CourseOffering updateCourseOffering(Long id, Integer maxCapacity, Boolean isPublished) {
        CourseOffering offering = courseOfferingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found with id: " + id));
        if (maxCapacity != null) {
            offering.setMaxCapacity(maxCapacity);
        }
        if (isPublished != null) {
            offering.setIsPublished(isPublished);
        }
        return courseOfferingRepository.save(offering);
    }

    @Transactional
    public void deleteCourseOffering(Long id) {
        if (!courseOfferingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course offering not found with id: " + id);
        }
        courseOfferingRepository.deleteById(id);
    }


    @Transactional(readOnly = true)
    public List<CourseOfferingResponse> getAllCourseOfferings() {
        return courseOfferingRepository.findAll().stream()
                .map(courseOfferingMapper::toResponse)
                .toList();
    }
}