package com.erp.academic.curriculum.repository;

import com.erp.academic.curriculum.entity.CurriculumCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumCourseRepository extends JpaRepository<CurriculumCourse, Long> {

    List<CurriculumCourse> findByCurriculumId(Long curriculumId);

    Optional<CurriculumCourse> findByCurriculumIdAndCourseId(Long curriculumId, Long courseId);

    boolean existsByCurriculumIdAndCourseId(Long curriculumId, Long courseId);

    void deleteByCurriculumIdAndCourseId(Long curriculumId, Long courseId);

    void deleteByCurriculumId(Long curriculumId);
}
