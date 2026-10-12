package com.erp.academic.course_offering.repository;

import com.erp.academic.course_offering.entity.CourseOffering;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, Long> {

    @EntityGraph(attributePaths = {"course", "semester"})
    List<CourseOffering> findAll();

    List<CourseOffering> findBySemesterId(Long semesterId);

    List<CourseOffering> findByCourseId(Long courseId);

    boolean existsByCourseIdAndSemesterId(Long courseId, Long semesterId);
}
