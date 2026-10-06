package com.erp.academic.course_registration.repository;

import com.erp.academic.course_registration.entity.CourseRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Long> {
    List<CourseRegistration> findByStudentId(Long studentId);
    List<CourseRegistration> findByCourseOfferingId(Long courseOfferingId);
    boolean existsByStudentIdAndCourseOfferingId(Long studentId, Long courseOfferingId);
}
