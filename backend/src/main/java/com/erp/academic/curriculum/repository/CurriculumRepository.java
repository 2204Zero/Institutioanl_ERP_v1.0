package com.erp.academic.curriculum.repository;

import com.erp.academic.curriculum.entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {

    List<Curriculum> findByProgramId(Long programId);

    List<Curriculum> findBySemesterId(Long semesterId);

    List<Curriculum> findByEffectiveAcademicYearId(Long effectiveAcademicYearId);

    @Query("SELECT c FROM Curriculum c WHERE " +
           "(:programId IS NULL OR c.programId = :programId) AND " +
           "(:semesterId IS NULL OR c.semesterId = :semesterId) AND " +
           "(:academicYearId IS NULL OR c.effectiveAcademicYearId = :academicYearId) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive) " +
           "ORDER BY c.version ASC")
    List<Curriculum> searchAndFilter(@Param("programId") Long programId,
                                     @Param("semesterId") Long semesterId,
                                     @Param("academicYearId") Long academicYearId,
                                     @Param("isActive") Boolean isActive);
}
