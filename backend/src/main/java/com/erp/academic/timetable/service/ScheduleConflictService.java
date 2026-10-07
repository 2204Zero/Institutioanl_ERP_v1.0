package com.erp.academic.timetable.service;

import com.erp.academic.room.entity.Room;
import com.erp.academic.room.repository.RoomRepository;
import com.erp.academic.section.entity.Section;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.academic.timetable.entity.ClassSchedule;
import com.erp.academic.timetable.entity.TimeSlot;
import com.erp.academic.timetable.repository.ClassScheduleRepository;
import com.erp.academic.timetable.repository.TimeSlotRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScheduleConflictService {

    private final ClassScheduleRepository classScheduleRepository;
    private final SectionRepository sectionRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Transactional
    public ClassSchedule allocateSchedule(Long sectionId, Long roomId, Long timeSlotId, Long facultyId) {
        
        Section section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
            .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found"));

        // 1. Room Conflict Detection (Day 5 Logic)
        if (classScheduleRepository.existsByRoomIdAndTimeSlotId(roomId, timeSlotId)) {
            throw new BusinessException("Schedule Conflict: Room " + room.getName() + " is already booked for this time slot.");
        }

        // 2. Faculty Conflict Detection (Day 5 Logic)
        if (classScheduleRepository.existsByFacultyIdAndTimeSlotId(facultyId, timeSlotId)) {
            throw new BusinessException("Schedule Conflict: Faculty member is already teaching a class during this time slot.");
        }

        // 3. Section Conflict Detection (Day 5 Logic)
        if (classScheduleRepository.existsBySectionIdAndTimeSlotId(sectionId, timeSlotId)) {
            throw new BusinessException("Schedule Conflict: The section " + section.getName() + " is already scheduled for a class at this time slot.");
        }

        ClassSchedule schedule = ClassSchedule.builder()
                .section(section)
                .room(room)
                .timeSlot(timeSlot)
                .facultyId(facultyId)
                .build();

        return classScheduleRepository.save(schedule);
    }
}
