package com.erp.academic.academic_year.repository;

import com.erp.academic.academic_year.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    @Query("SELECT a FROM AcademicYear a WHERE a.isActive = true AND a.id != :excludeId")
    List<AcademicYear> findActiveExcluding(@Param("excludeId") Long excludeId);

    @Query("SELECT a FROM AcademicYear a WHERE a.isActive = true")
    List<AcademicYear> findAllActive();

    @Query("SELECT a FROM AcademicYear a WHERE a.startDate <= :endDate AND a.endDate >= :startDate AND (:excludeId IS NULL OR a.id != :excludeId)")
    List<AcademicYear> findOverlapping(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("excludeId") Long excludeId);
}
