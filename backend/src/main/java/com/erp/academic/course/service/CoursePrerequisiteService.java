package com.erp.academic.course.service;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.entity.CoursePrerequisite;
import com.erp.academic.course.repository.CoursePrerequisiteRepository;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.common.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoursePrerequisiteService {

    private final CoursePrerequisiteRepository prerequisiteRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public CoursePrerequisite addPrerequisite(Long courseId, Long prereqCourseId) {
        if (courseId.equals(prereqCourseId)) {
            throw new ValidationException("A course cannot be a prerequisite for itself.");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        Course prereq = courseRepository.findById(prereqCourseId)
                .orElseThrow(() -> new ResourceNotFoundException("Prerequisite Course not found"));

        if (prerequisiteRepository.existsByCourseIdAndPrerequisiteCourseId(courseId, prereqCourseId)) {
            throw new BusinessException("This prerequisite already exists.");
        }

        // Circular Dependency Check: Does the prerequisite require the main course?
        if (hasCircularDependency(prereqCourseId, courseId)) {
            throw new BusinessException("Circular dependency detected: The prerequisite course already relies on this course.");
        }

        CoursePrerequisite mapping = CoursePrerequisite.builder()
                .course(course)
                .prerequisiteCourse(prereq)
                .build();

        return prerequisiteRepository.save(mapping);
    }

    private boolean hasCircularDependency(Long currentCourseId, Long targetCourseId) {
        Set<Long> visited = new HashSet<>();
        return checkCycleRecursive(currentCourseId, targetCourseId, visited);
    }

    private boolean checkCycleRecursive(Long currentCourseId, Long targetCourseId, Set<Long> visited) {
        if (currentCourseId.equals(targetCourseId)) return true;
        if (!visited.add(currentCourseId)) return false; // Already visited, prevent infinite loop

        List<CoursePrerequisite> reqs = prerequisiteRepository.findByCourseId(currentCourseId);
        for (CoursePrerequisite req : reqs) {
            if (checkCycleRecursive(req.getPrerequisiteCourse().getId(), targetCourseId, visited)) {
                return true;
            }
        }
        return false;
    }
}
