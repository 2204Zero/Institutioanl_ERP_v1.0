package com.erp.academic.course_registration.repository;

import com.erp.academic.course_registration.entity.CourseRegistration;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRegistrationRepository extends JpaRepository<CourseRegistration, Long> {
    @EntityGraph(attributePaths = {"courseOffering", "courseOffering.course", "courseOffering.semester", "section", "student"})
    List<CourseRegistration> findByStudentId(Long studentId);

    @EntityGraph(attributePaths = {"courseOffering", "courseOffering.course", "courseOffering.semester", "section", "student"})
    Optional<CourseRegistration> findById(Long id);

    List<CourseRegistration> findByCourseOfferingId(Long courseOfferingId);
    boolean existsByStudentIdAndCourseOfferingId(Long studentId, Long courseOfferingId);
}
