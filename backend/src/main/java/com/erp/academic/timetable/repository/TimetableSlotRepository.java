package com.erp.academic.timetable.repository;

import com.erp.academic.timetable.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    
    // Conflict Detection Logic for Module 37
    @Query("SELECT COUNT(t) FROM TimetableSlot t WHERE t.isActive = true AND t.dayOfWeek = :dayOfWeek " +
           "AND ((t.startTime < :endTime AND t.endTime > :startTime)) " +
           "AND (t.facultyId = :facultyId OR t.roomId = :roomId OR t.sectionId = :sectionId)")
    long countConflicts(@Param("dayOfWeek") DayOfWeek dayOfWeek, 
                        @Param("startTime") LocalTime startTime, 
                        @Param("endTime") LocalTime endTime, 
                        @Param("facultyId") Long facultyId, 
                        @Param("roomId") Long roomId, 
                        @Param("sectionId") Long sectionId);

    List<TimetableSlot> findBySectionIdAndIsActiveTrue(Long sectionId);

    List<TimetableSlot> findByFacultyIdAndIsActiveTrue(Long facultyId);
}
