package com.erp.academic.section.repository;

import com.erp.academic.section.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import com.erp.academic.timetable.entity.TimetableSlot;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByCourseOfferingId(Long courseOfferingId);

    @Query("SELECT s FROM Section s WHERE " +
           "(CAST(:search AS string) IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:courseOfferingId IS NULL OR s.courseOffering.id = :courseOfferingId) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive)")
    List<Section> searchAndFilter(
            @Param("search") String search, 
            @Param("courseOfferingId") Long courseOfferingId, 
            @Param("isActive") Boolean isActive);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Section s WHERE s.id = :id")
    Optional<Section> findByIdWithPessimisticWriteLock(@Param("id") Long id);

    @Query("SELECT DISTINCT s FROM Section s " +
           "LEFT JOIN SectionFaculty sf ON s.id = sf.sectionId " +
           "LEFT JOIN TimetableSlot ts ON s.id = ts.sectionId AND ts.isActive = true " +
           "WHERE (sf.facultyId = :facultyId OR ts.facultyId = :facultyId) AND s.isActive = true")
    List<Section> findActiveSectionsByFacultyId(@Param("facultyId") Long facultyId);
}
