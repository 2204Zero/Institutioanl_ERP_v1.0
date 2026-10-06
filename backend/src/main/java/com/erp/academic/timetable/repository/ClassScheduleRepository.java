package com.erp.academic.timetable.repository;

import com.erp.academic.timetable.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    boolean existsByRoomIdAndTimeSlotId(Long roomId, Long timeSlotId);
    boolean existsByFacultyIdAndTimeSlotId(Long facultyId, Long timeSlotId);
    boolean existsBySectionIdAndTimeSlotId(Long sectionId, Long timeSlotId);
}
