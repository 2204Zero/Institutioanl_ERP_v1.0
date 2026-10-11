package com.erp.academic.timetable.service;

import com.erp.academic.timetable.entity.TimetableSlot;
import com.erp.academic.timetable.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.erp.academic.room.repository.RoomRepository;
import com.erp.academic.section.repository.SectionRepository;
import com.erp.faculty.repository.FacultyRepository;
import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class TimetableService {
    
    private final TimetableSlotRepository repository;
    private final RoomRepository roomRepository;
    private final SectionRepository sectionRepository;
    private final FacultyRepository facultyRepository;

    @Transactional
    public TimetableSlot allocateSlot(TimetableSlot slot) {
        if (!roomRepository.existsById(slot.getRoomId())) {
            throw new ResourceNotFoundException("Room not found");
        }
        if (!sectionRepository.existsById(slot.getSectionId())) {
            throw new ResourceNotFoundException("Section not found");
        }
        if (!facultyRepository.existsById(slot.getFacultyId())) {
            throw new ResourceNotFoundException("Faculty not found");
        }
        if (slot.getEndTime().isBefore(slot.getStartTime()) || slot.getEndTime().equals(slot.getStartTime())) {
            throw new BusinessException("End time must be after start time");
        }

        // Module 37: Schedule Conflict Detection
        long conflicts = repository.countConflicts(
                slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime(),
                slot.getFacultyId(), slot.getRoomId(), slot.getSectionId()
        );
        
        if (conflicts > 0) {
            throw new BusinessException("Schedule Conflict Detected: Faculty, Room, or Section is already booked at this time.");
        }
        
        return repository.save(slot);
    }

    public List<TimetableSlot> getSectionTimetable(Long sectionId) {
        return repository.findBySectionIdAndIsActiveTrue(sectionId);
    }
}
