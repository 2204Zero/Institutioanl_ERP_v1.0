package com.erp.academic.semester.repository;

import com.erp.academic.semester.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    List<Semester> findByAcademicYearId(Long academicYearId);

    List<Semester> findByIsActive(Boolean isActive);

    boolean existsByAcademicYearIdAndSemesterNumber(Long academicYearId, Integer semesterNumber);

    boolean existsByAcademicYearIdAndSemesterNumberAndIdNot(Long academicYearId, Integer semesterNumber, Long id);

    @Query("SELECT s FROM Semester s WHERE " +
           "(:academicYearId IS NULL OR s.academicYearId = :academicYearId) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive) " +
           "ORDER BY s.semesterNumber ASC")
    List<Semester> findByFilters(@Param("academicYearId") Long academicYearId,
                                 @Param("isActive") Boolean isActive);
}
