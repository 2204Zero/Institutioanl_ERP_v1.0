package com.erp.academic.course.service;

import com.erp.academic.course.entity.Course;
import com.erp.academic.course.entity.CoursePrerequisite;
import com.erp.academic.course.repository.CoursePrerequisiteRepository;
import com.erp.academic.course.repository.CourseRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CoursePrerequisiteServiceTest {

    @Mock
    private CoursePrerequisiteRepository prerequisiteRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private CoursePrerequisiteService prerequisiteService;

    private Course courseA;
    private Course courseB;
    private Course courseC;

    @BeforeEach
    void setUp() {
        courseA = new Course(); courseA.setId(1L); courseA.setName("Course A");
        courseB = new Course(); courseB.setId(2L); courseB.setName("Course B");
        courseC = new Course(); courseC.setId(3L); courseC.setName("Course C");
    }

    @Test
    void testSelfPrerequisiteThrowsException() {
        assertThrows(ValidationException.class, () -> 
            prerequisiteService.addPrerequisite(1L, 1L));
    }

    @Test
    void testCircularDependencyThrowsException() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(courseA));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(courseB));
        when(prerequisiteRepository.existsByCourseIdAndPrerequisiteCourseId(1L, 2L)).thenReturn(false);

        // Simulate that B already has A as a prerequisite (A -> B -> A cycle)
        CoursePrerequisite existingReq = CoursePrerequisite.builder()
                .course(courseB).prerequisiteCourse(courseA).build();
        when(prerequisiteRepository.findByCourseId(2L)).thenReturn(List.of(existingReq));
        BusinessException exception = assertThrows(BusinessException.class, () -> 
            prerequisiteService.addPrerequisite(1L, 2L));

        assertTrue(exception.getMessage().contains("Circular dependency"));
    }

    @Test
    void testValidPrerequisiteAdded() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(courseA));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(courseB));
        when(prerequisiteRepository.existsByCourseIdAndPrerequisiteCourseId(1L, 2L)).thenReturn(false);
        when(prerequisiteRepository.findByCourseId(2L)).thenReturn(List.of());

        CoursePrerequisite mockSaved = CoursePrerequisite.builder()
                .id(100L).course(courseA).prerequisiteCourse(courseB).build();
        when(prerequisiteRepository.save(any())).thenReturn(mockSaved);

        CoursePrerequisite result = prerequisiteService.addPrerequisite(1L, 2L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(prerequisiteRepository, times(1)).save(any(CoursePrerequisite.class));
    }
}
