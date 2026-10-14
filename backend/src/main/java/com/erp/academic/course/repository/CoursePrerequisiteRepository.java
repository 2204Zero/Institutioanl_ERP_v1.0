package com.erp.academic.course.repository;

import com.erp.academic.course.entity.CoursePrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoursePrerequisiteRepository extends JpaRepository<CoursePrerequisite, Long> {

    List<CoursePrerequisite> findByCourseId(Long courseId);

    List<CoursePrerequisite> findByPrerequisiteCourseId(Long prerequisiteCourseId);
    
    boolean existsByCourseIdAndPrerequisiteCourseId(Long courseId, Long prerequisiteCourseId);

    Optional<CoursePrerequisite> findByCourseIdAndPrerequisiteCourseId(Long courseId, Long prerequisiteCourseId);

    void deleteByCourseIdAndPrerequisiteCourseId(Long courseId, Long prerequisiteCourseId);
}

